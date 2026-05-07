"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGemini = askGemini;
exports.explainError = explainError;
exports.generateDocumentation = generateDocumentation;
exports.reviewAndOptimize = reviewAndOptimize;
exports.generateComponent = generateComponent;
const vscode = __importStar(require("vscode"));
const generative_ai_1 = require("@google/generative-ai");
// API anahtarını VS Code ayarlarından güvenli şekilde alır
function getApiKey() {
    const key = vscode.workspace
        .getConfiguration("codesense")
        .get("geminiApiKey");
    if (!key || key.trim() === "") {
        throw new Error("Gemini API anahtarı bulunamadı. " +
            "Lütfen Ayarlar > CodeSense > Gemini Api Key alanını doldurun.");
    }
    return key.trim();
}
// Markdown kod bloklarını temizler (```js ... ``` → düz metin)
function cleanResponse(text) {
    return text
        .replace(/```[\w]*\n?/g, "")
        .replace(/```/g, "")
        .trim();
}
// Tüm komutların kullandığı tek nokta: koda prompt gönder, cevap al
async function askGemini(systemInstruction, userCode) {
    const apiKey = getApiKey();
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
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
async function explainError(selectedText) {
    return askGemini(`Sen deneyimli bir yazılım geliştiricisin. 
Kullanıcı sana bir hata mesajı veya hatalı kod parçası gösterecek.
Şunları yap:
1. Hatanın ne anlama geldiğini SADECe Türkçe, teknik terim kullanmadan açıkla.
2. Bu hatanın en yaygın sebebini bir cümleyle belirt.
3. Somut bir çözüm öner.
Cevabı kısa tut, maksimum 5 cümle.`, selectedText);
}
async function generateDocumentation(selectedText, language) {
    const isJava = language === "java";
    return askGemini(`Sen bir kod dokümantasyon uzmanısın.
Kullanıcının verdiği fonksiyon veya metot için ${isJava ? "Javadoc" : "JSDoc"} formatında yorum bloğu yaz.
- Fonksiyonun ne yaptığını açıkla
- Her parametreyi (@param) belgele
- Dönüş değerini (@returns) belgele  
- Sadece yorum bloğunu yaz, kodu tekrarlama
- ${isJava ? "@param ve @return" : "@param ve @returns"} etiketlerini kullan
- Açıklamalar Türkçe olsun`, selectedText);
}
async function reviewAndOptimize(selectedText) {
    return askGemini(`Sen bir kıdemli yazılım mühendisisin. Sana verilen kodu analiz et ve optimize et.
SADECE şu formatta cevap ver (başka hiçbir şey yazma):

// OPTIMIZED CODE - Ne değiştirildi ve neden (her değişiklik için yorum satırı)
[buraya optimize edilmiş kodu yaz]

Dikkat et:
- Performans iyileştirmeleri yap
- Bellek kullanımını azalt
- Okunabilirliği artır
- Her önemli değişikliği // yorum ile açıkla`, selectedText);
}
async function generateComponent(prompt) {
    return askGemini(`Sen bir full-stack geliştiricisin. Kullanıcının isteğine göre tam çalışır kod üret.
- Next.js isteği varsa App Router ve TypeScript kullan
- Tailwind CSS kullanılacaksa class'ları ekle
- Java isteği varsa standart Java sözdizimini kullan
- SADECE kodu yaz, açıklama veya markdown ekleme
- Kodu doğrudan kullanıma hazır yaz`, prompt);
}
//# sourceMappingURL=gemini.service.js.map