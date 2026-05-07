import * as vscode from "vscode";
import {
  explainError,
  generateDocumentation,
  reviewAndOptimize,
  generateComponent,
} from "./gemini.service";

export function activate(context: vscode.ExtensionContext) {
  console.log("CodeSense aktif!");

  // ─────────────────────────────────────────────────────────────────────
  // KOMUT 1: Hata Çevirmen (Error Whisperer)
  // ─────────────────────────────────────────────────────────────────────
  const explainErrorCmd = vscode.commands.registerCommand(
    "codesense.explainError",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText.trim()) {
        vscode.window.showWarningMessage("Lütfen açıklanacak kodu veya hata mesajını seçin.");
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "CodeSense: Hata analiz ediliyor...",
          cancellable: false,
        },
        async () => {
          try {
            const explanation = await explainError(selectedText);
            // Açıklamayı bilgi penceresi olarak göster
            // Uzunsa kullanıcı "Detay" butonuyla tam metni görebilir
            const choice = await vscode.window.showInformationMessage(
              explanation.length > 200
                ? explanation.substring(0, 200) + "..."
                : explanation,
              "Detayları Göster"
            );
            if (choice === "Detayları Göster") {
              // Yeni bir output channel'da tam açıklamayı göster
              const channel = vscode.window.createOutputChannel("CodeSense: Hata Açıklaması");
              channel.appendLine(explanation);
              channel.show();
            }
          } catch (err: unknown) {
            vscode.window.showErrorMessage(`CodeSense Hata: ${(err as Error).message}`);
          }
        }
      );
    }
  );

  // ─────────────────────────────────────────────────────────────────────
  // KOMUT 2: Otomatik Dokümantasyon Üretici
  // ─────────────────────────────────────────────────────────────────────
  const generateDocCmd = vscode.commands.registerCommand(
    "codesense.generateDoc",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText.trim()) {
        vscode.window.showWarningMessage("Lütfen dokümante edilecek fonksiyonu seçin.");
        return;
      }

      const language = editor.document.languageId; // "typescript", "javascript", "java" vb.

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "CodeSense: Dokümantasyon yazılıyor...",
          cancellable: false,
        },
        async () => {
          try {
            const docComment = await generateDocumentation(selectedText, language);

            // Seçili metnin başına (üst satıra) dokümantasyonu ekle
            const selectionStart = editor.selection.start;
            const insertPosition = new vscode.Position(selectionStart.line, 0);

            await editor.edit((editBuilder) => {
              // Her satıra uygun girintileme ekle
              const indent = editor.document
                .lineAt(selectionStart.line)
                .text.match(/^\s*/)?.[0] ?? "";
              
              const indentedDoc = docComment
                .split("\n")
                .map((line) => indent + line)
                .join("\n") + "\n";

              editBuilder.insert(insertPosition, indentedDoc);
            });

            vscode.window.showInformationMessage("✅ CodeSense: Dokümantasyon eklendi!");
          } catch (err: unknown) {
            vscode.window.showErrorMessage(`CodeSense Hata: ${(err as Error).message}`);
          }
        }
      );
    }
  );

  // ─────────────────────────────────────────────────────────────────────
  // KOMUT 3: Acımasız İncelemeci (Code Reviewer / Optimizer)
  // ─────────────────────────────────────────────────────────────────────
  const reviewCodeCmd = vscode.commands.registerCommand(
    "codesense.reviewCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText.trim()) {
        vscode.window.showWarningMessage("Lütfen optimize edilecek kodu seçin.");
        return;
      }

      let optimizedCode = "";

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "CodeSense: Kod optimize ediliyor...",
          cancellable: false,
        },
        async () => {
          try {
            optimizedCode = await reviewAndOptimize(selectedText);
          } catch (err: unknown) {
            vscode.window.showErrorMessage(`CodeSense Hata: ${(err as Error).message}`);
            return;
          }
        }
      );

      if (!optimizedCode) return;

      // Diff görünümü için orijinal ve optimize kodu karşılaştır
      const originalUri = vscode.Uri.parse(
        `codesense-diff:Orijinal Kod?${encodeURIComponent(selectedText)}`
      );
      const optimizedUri = vscode.Uri.parse(
        `codesense-diff:Optimize Edilmiş Kod?${encodeURIComponent(optimizedCode)}`
      );

      // Virtual document provider'ı kaydet
      const provider = new (class implements vscode.TextDocumentContentProvider {
        provideTextDocumentContent(uri: vscode.Uri): string {
          return decodeURIComponent(uri.query);
        }
      })();

      const disposable = vscode.workspace.registerTextDocumentContentProvider(
        "codesense-diff",
        provider
      );
      context.subscriptions.push(disposable);

      // Ekranı ikiye bölerek diff göster
      await vscode.commands.executeCommand(
        "vscode.diff",
        originalUri,
        optimizedUri,
        "CodeSense: Orijinal ↔ Optimize Edilmiş",
        { preview: true }
      );
    }
  );

  // ─────────────────────────────────────────────────────────────────────
  // KOMUT 4: Hızlı Bileşen Üretici (Component Generator)
  // ─────────────────────────────────────────────────────────────────────
  const generateComponentCmd = vscode.commands.registerCommand(
    "codesense.generateComponent",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("Lütfen bir kod editörü açın.");
        return;
      }

      // Üstte Input Box aç
      const prompt = await vscode.window.showInputBox({
        placeHolder: "Örn: Next.js ile Tailwind navbar yap, TypeScript ile bir API handler yaz...",
        prompt: "CodeSense 🧠 — Ne üreteyim?",
        ignoreFocusOut: true,
      });

      if (!prompt || !prompt.trim()) return;

      let generatedCode = "";

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `CodeSense: "${prompt}" üretiliyor...`,
          cancellable: false,
        },
        async () => {
          try {
            generatedCode = await generateComponent(prompt);
          } catch (err: unknown) {
            vscode.window.showErrorMessage(`CodeSense Hata: ${(err as Error).message}`);
          }
        }
      );

      if (!generatedCode) return;

      // İmlecin bulunduğu konuma kodu yapıştır
      const cursorPosition = editor.selection.active;
      await editor.edit((editBuilder) => {
        editBuilder.insert(cursorPosition, generatedCode);
      });

      vscode.window.showInformationMessage("✅ CodeSense: Bileşen oluşturuldu ve yapıştırıldı!");
    }
  );

  // Tüm komutları context'e ekle (bellek temizliği için)
  context.subscriptions.push(
    explainErrorCmd,
    generateDocCmd,
    reviewCodeCmd,
    generateComponentCmd
  );
}

export function deactivate() {
  console.log("CodeSense deaktif.");
}