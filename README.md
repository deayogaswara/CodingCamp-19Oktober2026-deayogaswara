# To-Do List Life Dashboard

Dashboard pribadi untuk membantu pengguna melihat waktu, mengelola
daftar tugas, dan membuka tautan penting dari satu halaman. Project ini
dibuat menggunakan HTML, CSS, dan JavaScript vanilla, dengan penyimpanan
preferensi serta data tertentu di browser melalui Local Storage.

## Fitur Utama

-   **Jam dan tanggal digital** untuk melihat waktu dan tanggal saat
    ini.
-   **Sapaan personal** yang dapat disesuaikan dengan nama pengguna.
-   **Daftar tugas (to-do list)** untuk menambahkan, menyelesaikan, dan
    mengelola tugas, termasuk pencegahan tugas duplikat sesuai
    implementasi aplikasi.
-   **Focus timer 25 menit** untuk membantu sesi kerja terfokus.
-   **Tema terang dan gelap** yang dapat dipilih dan disimpan.
-   **Quick Links** untuk menyimpan, membuka, dan menghapus tautan yang
    sering digunakan.
-   **Penyimpanan lokal** agar data dan preferensi yang didukung tetap
    tersimpan di browser.
-   **Tampilan responsif** untuk menyesuaikan antarmuka dengan ukuran
    layar yang berbeda.

## Teknologi

-   **HTML5** untuk struktur halaman.
-   **CSS3** untuk tampilan, tema, dan layout responsif.
-   **JavaScript vanilla** untuk interaksi dan logika aplikasi.
-   **Browser Local Storage** untuk menyimpan data di perangkat/browser
    pengguna.

Project ini tidak memerlukan framework JavaScript atau proses build
khusus berdasarkan struktur project saat ini.

## Menjalankan Project Secara Lokal

1.  Unduh atau clone repository ke komputer.
2.  Buka folder project.
3.  Jalankan dengan salah satu cara berikut:
    -   Buka `index.html` langsung menggunakan browser; atau
    -   Buka folder project di Visual Studio Code/Kiro dan gunakan
        ekstensi local development server jika tersedia.
4.  Jika menggunakan server lokal, buka URL lokal yang ditampilkan oleh
    server tersebut.

**Catatan:** Data yang disimpan melalui Local Storage berada di browser
dan origin yang digunakan. Data tidak otomatis tersinkronisasi ke
perangkat atau browser lain. Menghapus data situs/browser dapat
menghapus data lokal tersebut.

## Website yang Dipublikasikan

Jika GitHub Pages sudah diaktifkan untuk repository ini, website dapat
diakses melalui URL GitHub Pages yang ditetapkan pada pengaturan
repository.

Format URL project GitHub Pages umumnya:

`https://<username>.github.io/<nama-repository>/`

Ganti `<username>` dan `<nama-repository>` sesuai konfigurasi
repository. URL publik belum dicantumkan sebagai alamat terverifikasi di
dokumen ini; pastikan deployment GitHub Pages sudah aktif dan uji
URL-nya sebelum membagikannya.

## Struktur Folder

``` text
CodingCamp-19Oktober2026-deayogaswara/
├── .kiro/
│   └── specs/
│       └── life-dashboard.md
├── css/
│   └── style.css
├── js/
│   └── script.js
├── index.html
└── CodingCamp-19Oktober2026-deayogaswara.code-workspace
```

### Keterangan File dan Folder

-   `.kiro/specs/life-dashboard.md` --- catatan spesifikasi project.
-   `css/style.css` --- aturan tampilan, layout, tema, dan
    responsivitas.
-   `js/script.js` --- logika interaksi dan fitur dashboard.
-   `index.html` --- halaman utama aplikasi.
-   `CodingCamp-19Oktober2026-deayogaswara.code-workspace` ---
    konfigurasi workspace untuk membuka project di editor yang mendukung
    format workspace; tidak diperlukan untuk menjalankan website.

## Catatan

-   README ini menjelaskan struktur project yang diketahui saat
    dokumentasi dibuat. Jika file atau folder berubah, perbarui bagian
    struktur folder agar tetap sesuai.
-   Sebelum membagikan website, pastikan semua fitur utama telah diuji
    dan URL publik dapat diakses.
