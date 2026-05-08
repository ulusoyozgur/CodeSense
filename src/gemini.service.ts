import * as vscode from "vscode";
import Groq from "groq-sdk";

function getApiKey(): string {
  const key = vscode.workspace
    .getConfiguration("codesense")
    .get<string>("groqApiKey");

  if (!key || key.trim() === "") {
    throw new Error(
      "Groq API anahtarı bulunamadı. " +
        "Lütfen Ayarlar > CodeSense > Groq Api Key alanını doldurun."
    );
  }
  return key.trim();
}

function cleanResponse(text: string): string {
  return text
    .replace(/```[\w]*\n?/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function askGemini(
  systemInstruction: string,
  userCode: string
): Promise<string> {
  const apiKey = getApiKey();
  const groq = new Groq({ apiKey });

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userCode },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  return cleanResponse(text);
}

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
