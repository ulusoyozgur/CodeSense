# CodeSense 🧠

> **VS Code için AI destekli İsviçre Çakısı** — Groq AI kullanarak kodlarını doğrudan editörün içinde analiz et, belgele, optimize et ve üret.

![Versiyon](https://img.shields.io/badge/versiyon-0.0.1-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-blue?logo=visualstudiocode)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Groq](https://img.shields.io/badge/Groq-AI-orange)
![Model](https://img.shields.io/badge/Llama%203.3-70B-purple)
![Lisans](https://img.shields.io/badge/lisans-MIT-green)

---

## ✨ Özellikler

### 🔴 Hata Çevirmen — `CodeSense: Hatayı Açıkla`
Herhangi bir hata mesajını veya bozuk kodu seç, sağ tıkla ve anında sade Türkçe açıklama ile somut çözüm önerisi al.

### ⚡ Kod İncelemeci — `CodeSense: Kodu Optimize Et`
Herhangi bir kod bloğu seç, CodeSense yan yana diff görünümü açar — solda orijinal kodun, sağda optimize edilmiş versiyon ve her değişikliği açıklayan satır içi Türkçe yorumlar.

### 📝 Dokümantasyon Üretici — `CodeSense: Dokümantasyon Yaz`
Bir fonksiyon veya metot seç, CodeSense otomatik olarak JSDoc (JavaScript/TypeScript) veya Javadoc (Java) yorum bloğu yazar ve doğrudan kodunun üstüne ekler. Kopyala-yapıştır yok.

### 🚀 Bileşen Üretici — `CodeSense: Bileşen Üret`
Klavye kısayoluna bas, isteğini sade dille yaz (örn. *"Next.js Tailwind navbar yap"*) ve CodeSense tam bileşeni üretip doğrudan imleç konumuna yapıştırır.

---

## 🛠 Kullanılan Araçlar

| Katman | Teknoloji |
|---|---|
| Dil | TypeScript 5.3 |
| Çalışma Ortamı | Node.js |
| Yapay Zeka | Groq API |
| Model | Llama 3.3 70B Versatile (Meta) |
| Editör API | VS Code Extension API |

> **Neden Groq + Llama 3.3 70B?**  
> Groq'un ücretsiz katmanında sunulan en güçlü model. Meta'nın 70 milyar parametreli Llama 3.3'ü, kod analizi ve üretiminde son derece başarılı sonuçlar veriyor — üstelik tamamen ücretsiz.

---

## 📦 Kurulum

### Gereksinimler
- [Node.js](https://nodejs.org) (v18+)
- [VS Code](https://code.visualstudio.com) (v1.85+)
- Ücretsiz [Groq API](https://console.groq.com) anahtarı

### Seçenek A — VSIX ile kur (önerilen)
```bash
code --install-extension codesense-0.0.1.vsix
```
Ya da **Eklentiler → ··· → VSIX'ten Yükle** seçeneğiyle dosyayı seç.

### Seçenek B — Kaynak koddan çalıştır
```bash
git clone https://github.com/ulusoyozgur/codesense.git
cd codesense
npm install
npm run compile
```
Ardından VS Code'da **F5**'e bas, Extension Development Host açılır.

---

## 🔑 API Anahtarı Kurulumu

1. [console.groq.com](https://console.groq.com) adresine git ve hesap oluştur (ücretsiz)
2. **API Keys** → **Create API Key** tıkla
3. Anahtarı kopyala
4. VS Code'da: **Dosya → Tercihler → Ayarlar** → `codesense` ara
5. **Codesense: Groq Api Key** alanına yapıştır

---

## 🎮 Kullanım

### Sağ Tık Menüsü ile
Kodu seç → sağ tıkla → **CodeSense 🧠** alt menüsü

### Klavye Kısayolları

| Komut | Windows / Linux | Mac |
|---|---|---|
| Dokümantasyon Yaz | `Ctrl+Shift+D` | `Cmd+Shift+D` |
| Bileşen Üret | `Ctrl+Shift+G` | `Cmd+Shift+G` |

### Örnek Kullanımlar

**Hata açıkla:**
1. Hata mesajını veya bozuk kodu seç
2. Sağ tık → CodeSense 🧠 → Hatayı Açıkla
3. Sade Türkçe açıklama + kod çözümü Output panelinde belirir

**Kodu optimize et:**
1. Kodu seç
2. Sağ tık → CodeSense 🧠 → Kodu Optimize Et
3. Diff görünümü açılır: sol orijinal, sağ optimize edilmiş + Türkçe yorumlar

**Fonksiyon belgele:**
1. Fonksiyonu seç
2. `Ctrl+Shift+D` tuşuna bas
3. JSDoc yorumu otomatik olarak fonksiyonun üstüne eklenir

**React/Next.js bileşeni üret:**
1. Boş bir dosya aç
2. `Ctrl+Shift+G` tuşuna bas
3. Yaz: *"Next.js Tailwind CSS ile mobil menülü navbar"*
4. Enter'a bas — kod imlece yapıştırılır

---

## 📁 Proje Yapısı

```
codesense/
├── src/
│   ├── extension.ts        ← Giriş noktası, 4 komutu kayıt eder
│   └── gemini.service.ts   ← Groq API istemcisi, prompt'lar, temizleme
├── out/                    ← Derlenmiş JavaScript (otomatik oluşturulur)
├── package.json            ← Eklenti manifestosu, komutlar, menüler, kısayollar
├── tsconfig.json
└── .vscodeignore
```

---

## ⚙️ Yapılandırma

| Ayar | Açıklama | Varsayılan |
|---|---|---|
| `codesense.groqApiKey` | Groq API anahtarın | `""` |

---

## 🚧 Sınırlamalar

- Groq ücretsiz katmanında dakika başına istek limiti vardır. Limite ulaşırsan kısa bir süre bekle.
- API'ye bağlanmak için aktif internet bağlantısı gerekir.
- Üretilen kodlar production'a almadan önce mutlaka gözden geçirilmelidir.

---

## 🗺 Yol Haritası

- [ ] Satır içi kod önerileri (ghost text)
- [ ] Çok dosyalı bağlam desteği
- [ ] Daha fazla dil desteği (Python, Go, Rust)
- [ ] Yerel model desteği (Ollama)
- [ ] Özelleştirilebilir prompt ayarları paneli

---

## 🤝 Katkı

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue aç, ne yapmak istediğini tartışalım.

---

## 📄 Lisans

[MIT](LICENSE)

---

<p align="center">❤️ ve fazla kahveyle yapıldı</p>
