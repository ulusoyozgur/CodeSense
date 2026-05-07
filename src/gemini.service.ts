import * as vscode from "vscode";
import { GoogleGenerativeAI } from "@google/generative-ai";

// API anahtarını VS Code ayarlarından güvenli şekilde alır
function getApiKey(): string {
  const key = vscode.workspace
    .getConfiguration("codesense")
    .get<string>("geminiApiKey");

  if (!key || key.trim() === "") {
    throw new Error(
      "Gemini API anahtarı bulunamadı. " +
        "Lütfen Ayarlar > CodeSense > Gemini Api Key alanını doldurun."
    );
  }
  return key.trim();
}

// Markdown kod bloklarını temizler (```js ... ``` → düz metin)
function cleanResponse(text: string): string {
  return text
    .replace(/```[\w]*\n?/g, "")
    .replace(/```/g, "")
    .trim();
}

// Tüm komutların kullandığı tek nokta: koda prompt gönder, cevap al
export async function askGemini(
  systemInstruction: string,
  userCode: string
): Promise<string> {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest", 
    systemInstruction: {
      role: "user",
      parts: [{ text: systemInstruction }],
    },
  });

  const result = await model.generateContent(userCode);
  const response = result.response.text();
  return cleanResponse(response);
}

// --- Komutlara özel yardımcı fonksiyonlar ---

export async function explainError(selectedText: string): Promise<string> {
  return askGemini(
    `Sen deneyimli bir yazılım geliştiricisin. 
Kullanıcı sana bir hata mesajı veya hatalı kod parçası gösterecek.
Şunları yap:
1. Hatanın ne anlama geldiğini SADECe Türkçe, teknik terim kullanmadan açıkla.
2. Bu hatanın en yaygın sebebini bir cümleyle belirt.
3. Somut bir çözüm öner.
Cevabı kısa tut, maksimum 5 cümle.`,
    selectedText
  );
}

export async function generateDocumentation(
  selectedText: string,
  language: string
): Promise<string> {
  const isJava = language === "java";

  return askGemini(
    `Sen bir kod dokümantasyon uzmanısın.
Kullanıcının verdiği fonksiyon veya metot için ${isJava ? "Javadoc" : "JSDoc"} formatında yorum bloğu yaz.
- Fonksiyonun ne yaptığını açıkla
- Her parametreyi (@param) belgele
- Dönüş değerini (@returns) belgele  
- Sadece yorum bloğunu yaz, kodu tekrarlama
- ${isJava ? "@param ve @return" : "@param ve @returns"} etiketlerini kullan
- Açıklamalar Türkçe olsun`,
    selectedText
  );
}

export async function reviewAndOptimize(
  selectedText: string
): Promise<string> {
  return askGemini(
    `Sen bir kıdemli yazılım mühendisisin. Sana verilen kodu analiz et ve optimize et.
SADECE şu formatta cevap ver (başka hiçbir şey yazma):

// OPTIMIZED CODE - Ne değiştirildi ve neden (her değişiklik için yorum satırı)
[buraya optimize edilmiş kodu yaz]

Dikkat et:
- Performans iyileştirmeleri yap
- Bellek kullanımını azalt
- Okunabilirliği artır
- Her önemli değişikliği // yorum ile açıkla`,
    selectedText
  );
}

export async function generateComponent(prompt: string): Promise<string> {
  return askGemini(
    `Sen bir full-stack geliştiricisin. Kullanıcının isteğine göre tam çalışır kod üret.
- Next.js isteği varsa App Router ve TypeScript kullan
- Tailwind CSS kullanılacaksa class'ları ekle
- Java isteği varsa standart Java sözdizimini kullan
- SADECE kodu yaz, açıklama veya markdown ekleme
- Kodu doğrudan kullanıma hazır yaz`,
    prompt
  );
}