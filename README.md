# Blockout — Level Design Studio

3D oyunlar için metre bazlı, üstten 2D level tasarım aracı. Türkçe HTML/CSS/JavaScript editör, kalıcı bulut kayıtları ve Streamable HTTP MCP sunucusu.

Bu depo bağımsız kaynak kopyasıdır; kişisel Sites yayın yapılandırması, yerel veritabanları ve erişim bilgileri dahil değildir. Node 24 ile `npm run build` ve `npm test` çalıştırılarak doğrulanmıştır.

Roblox geliştirmesi hedeflenmektedir. Stud ölçüsü, Roblox Studio aktarımı ve Studio eklentisi henüz uygulanmamıştır; mevcut sürüm metre kullanır ve 3D geometriyi OBJ olarak dışa aktarır.

## Başlatma

Bu klasörde `npm install`, `npm run build`, ardından `node server.cjs` çalıştır ve http://127.0.0.1:5173 adresini aç. Hazır derleme mevcutsa `start.cmd` yeterlidir. Yerel sunucu Node 22.13 veya üstü `node:sqlite` desteği gerektirir; Node 24 ile test edilmiştir.
Yerel veritabanı `.sites-runtime/blockout.sqlite` dosyasında tutulur. Yerel sunucu yalnız 127.0.0.1'e bağlanır ve geliştirici kimliği kullanır. Yayımlanan sunucu Sites kimliğini ve Cloudflare D1 kaydını kullanır.

## Araçlar

- Odalar, duvarlar, kapılar, siperler, oynanış bölgeleri, rotalar ve notlar.
- Başlangıç, düşman, hedef ve eşya işaretleri.
- Izgaraya hizalama (0.5, 1 veya 2 metre), zoom, pan ve minimap.
- Öğeleri taşıma, oda/siper/bölge boyutunu köşelerden değiştirme, çoklu seçim, çoğaltma, 90° döndürme.
- Ölçüler, yükseklik, kot, renk ve oynanış etiketi düzenleme.
- Katman görünürlüğü ve kilidi, 100 adımlık geri alma/yineleme.
- Tarayıcıda otomatik kayıt, JSON dosyasıyla proje kaydetme ve açma.
- PNG ve SVG planı, metre bazlı 3D OBJ geometri dışa aktarımı.
- Döndürülebilen izometrik 3D blockout önizlemesi.

## Koordinatlar ve dışa aktarma

Planda X sağa, Z aşağıya gider; 3D'de Y yüksekliktir. 1 birim = 1 metre.
OBJ, oda zeminlerini ve çevre duvarlarını, bağımsız duvarları ve siperleri içerir. Kapılar oda kenarına hizalı olduğunda açıklık ve üst lento oluşturulur. Rota, not, hedef ve diğer oyun öğeleri JSON projesinde korunur; OBJ'ye oyun mantığı olarak aktarılmaz. OBJ metin dosyası materyal veya collider içermez. Oyun motoruna aktardıktan sonra materyal, collider ve gameplay bileşenlerini ekle.

3D görünüm, aynı OBJ geometrisinin izometrik görselleştirmesidir. Düzenleme 2D plan üzerinden yapılır. 3D görünümde sürükleme açıyı değiştirir, tekerlek yakınlaştırır.

Yerel çizimler tarayıcı taslağında tutulur. **AI Haritaları → Mevcut haritayı buluta kaydet** ile sunucuda kalıcı bir proje oluşturulur. Bulut haritası açıkken kullanıcı ve MCP değişiklikleri aynı belge üzerinden eşitlenir. Sürüm çakışmasında yerel değişiklikler korunur ve yeni kopya kaydetme veya JSON yedekleme istenir. JSON indirerek bağımsız bir yedek oluşturabilirsin. Google Fonts erişilemezse sistem fontları kullanılır.

## Kısayollar

V seç, H kaydır, R oda, W duvar, D kapı, C siper, Z bölge, P rota, N not, E silgi. Space + sürükle kaydırır. Shift, çoklu seçimi veya düz çizimi etkinleştirir. F haritayı sığdırır. Ctrl+Z/Ctrl+Shift+Z geri alır/yineler. Ctrl+D çoğaltır. Delete siler. Ctrl+S JSON indirir. Ok tuşları seçimi ızgara adımıyla taşır.

## Kontrol

`node --check dist/app.js`

`npm test`

Destekleyen tarayıcılarda WebMCP araçları proje okuma ve toplu level öğesi ekleme işlemlerini sunar. Uzaktan MCP bağlantısı `/mcp` adresindedir. Ayrıntılar: [MCP kullanım rehberi](MCP.md).
