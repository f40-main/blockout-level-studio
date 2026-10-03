# Kendi kurulumun için not

Yerel MCP adresi: http://127.0.0.1:5173/mcp. Aşağıdaki uzak bağlantı örnekleri, OAuth ile korunan kendi Blockout kurulumunu gerektirir. Bu kaynak deposu kişisel Sites proje kimliği veya kullanıcı verisi içermez. Yerel sunucu yalnız geliştirme için yerel kimlik kullanır; doğrudan internete açılmamalıdır.

# Blockout MCP kullanımı

Blockout, modelin çağırabileceği bir araç sunucusu sağlar. GPT, Claude veya Gemini, bu araçlara MCP destekleyen uygulaması ya da API istemcisi üzerinden bağlanır. Editöre model API anahtarı girmen gerekmez. API ile ayrı bir uygulama çalıştırırsan model sağlayıcının API anahtarı ve Blockout OAuth erişim tokenı ayrı kimlik bilgileridir.

## Kullanım akışı

1. ChatGPT / Codex'te Sites'ın oluşturduğu **Blockout — Level Design Studio** eklentisini kur ve bağla. Eklentiler → Kişisel → Oluşturdukların bölümünden bulunabilir.
2. Sohbette Blockout araçlarını etkinleştir ve istediğin leveli tarif et.
3. Model önce tasarım rehberini okuyabilir, sonra `create_level_project` ile haritayı oluşturur. Sonuçtaki `editor_url`, o haritayı doğrudan açar.
4. Editörde **AI Haritaları** bölümünde projeyi seç. Açık bulut haritası modelin değişikliklerini yaklaşık 4 saniyede alır. Elle yapılan değişiklikler de buluta kaydedilir.
5. Mevcut bir çizimi modele düzenletmek için önce **Mevcut haritayı buluta kaydet**. Model `list_level_projects` ve `get_level_project` ile projeyi okuyup `apply_level_edits` ile düzenler.

## Araçlar

| Araç | İşlev |
| --- | --- |
| `get_level_design_guide` | Ölçek, koordinat, geometri ve iş akışı rehberi |
| `list_level_projects` | Oturum açmış kullanıcının haritaları |
| `get_level_project` | Bir haritanın tüm öğeleri ve güncel sürümü |
| `create_level_project` | Kalıcı harita oluşturma, editör bağlantısı döndürme |
| `apply_level_edits` | Tek işlemde 1–300 öğe ekleme, düzenleme veya kaldırma |

Planda `x/y`, 3D dünyada `X/Z` demektir. `height` ve `elevation` dünya `Y` ölçüleridir. Tüm ölçüler metre cinsindendir. Odalar, siperler ve bölgeler `w/h`; duvar ve kapılar `x2/y2`; rotalar `points` gerektirir. Koridorlar dar odalar olarak çizilir. Kapıları temas eden oda kenarlarına hizala.

### Örnek istek

> Blockout'ta 40 × 30 metre bir gizlilik leveli oluştur. Altı oda, bağlı koridorlar, kapılar ve siperler kullan. Oyuncu başlangıcı, dört düşman ve bir hedef yerleştir. Başlangıçtan hedefe ana rota ve alternatif rota çiz. Geçişlerin açık olduğunu kontrol et ve düzenleyebileceğim editör bağlantısını ver.

### Düzenleme isteği

> Blockout haritalarımı listele. “Depo Baskını” projesini oku; ana salonu 4 metre genişlet ve kuzey tarafına 3 metrelik bir kapı aç. Güncel revision değerini kullan, mevcut öğeleri koru.

## GPT / ChatGPT / Codex

Sites'ın provision ettiği Blockout eklentisini kullan. Aynı site ve aynı özel eklenti güncellenir. Bağlantı için Sites tarafından döndürülen MCP adresi ve OAuth resource değeri kullanılır. OpenAI Responses API uzaktan MCP sunucularını `type: "mcp"`, `server_label`, `server_url` ve gerektiğinde `authorization` alanlarıyla destekler. OAuth tokenını uygulaman ayrı olarak almalıdır; model API anahtarı Blockout oturumu yerine geçmez.

Resmi kaynak: https://developers.openai.com/api/docs/guides/tools-connectors-mcp

## Claude

Claude'da **Customize → Connectors → Add custom connector** üzerinden sunucu adresini ekle. Kimlik doğrulama akışını tamamlayıp sohbet için bağlantıyı etkinleştir. Claude API'de uzak MCP connector desteği de bulunur.

Özel Sites sunucusunda istemcinin Sites OAuth bağlantısını tamamlayabilmesi gerekir. Claude hesabındaki seçeneklere ve Sites'ın üçüncü taraf istemci desteğine bağlıdır; bu projede Claude oturumuyla bağlantı testi yapılmadı. Kimlik doğrulama başarısızsa sunucuyu public yaparak veya erişim kontrollerini kaldırarak çözme.

Resmi kaynak: https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp

## Gemini

Google'ın Interactions API'sinde Streamable HTTP MCP sunucusu `tools` içindeki `type: "mcp_server"`, `name: "blockout"`, `url` alanlarıyla tanımlanabilir. Kimlik doğrulama için `headers` alanı vardır. MCP sunucu adında tire yerine snake_case kullanılır. Gemini sohbet uygulaması ile MCP destekleyen SDK/istemci aynı şey değildir; API ya da MCP istemcisi üzerinden bağlan.

Örnek bağlantı tanımı (bir API çağrısının `tools` alanına eklenir; tek başına çalıştırılabilir uygulama değildir):

```json
{
  "type": "mcp_server",
  "name": "blockout",
  "url": "https://YOUR_BLOCKOUT_HOST/mcp",
  "headers": {"Authorization": "Bearer <Sites OAuth access token>"},
  "allowed_tools": ["get_level_design_guide", "list_level_projects", "get_level_project", "create_level_project", "apply_level_edits"]
}
```

Token bir erişim kimliğidir; kaynak koduna veya paylaşılacak proje dosyasına yazma. Sites OAuth akışı harita sahibini tanımlamalıdır. Gemini hesabıyla canlı bağlantı testi yapılmadı.

Resmi kaynak: https://ai.google.dev/gemini-api/docs/function-calling#remote-mcp-model-context-protocol

## Kayıt ve çakışmalar

MCP istemcisi tarayıcının localStorage verisini doğrudan okumaz. Bulut projelerini kullanır. Editör açılan bulut projesini ortak kayda bağlar. `expected_revision` zorunludur: başka bir editör veya model belgeyi değiştirdiyse eski sürüme yazma reddedilir. Geçersiz ölçü veya kilitli katman varsa düzenleme grubunun tamamı reddedilir. Yerel taslak korunur; yeniden bağlanmak için JSON yedekleyebilir veya yeni bulut kopyası oluşturabilirsin.

MCP kimlik doğrulaması Sites tarafından yönetilir. Veri taşıyan işlemler sunucuda kullanıcı kimliğini ve proje sahipliğini kontrol eder. Başka kullanıcının projesi okunamaz veya düzenlenemez.
