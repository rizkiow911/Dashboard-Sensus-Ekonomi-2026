/* =====================================================================
   SHARED-CONFIG.JS
   Satu tempat untuk semua pengaturan yang dipakai bersama oleh seluruh
   halaman dashboard SE2026 Jakarta Timur.

   CATATAN PENTING (per 30 Jul 2026, revisi ke-2) — nama tab asli:
   Nama tab data mentah TERNYATA "Sheet1" (nama default Google Sheets),
   BUKAN "Master Data" seperti asumsi sebelumnya. Ini yang bikin upload
   ditolak Apps Script ("Tab Master Data tidak ditemukan") dan Halaman
   Utama diam-diam menampilkan data contoh (gviz Google jatuh ke tab
   pertama saat nama yang diminta tak ketemu, jadi tidak error keras,
   cuma salah tab).

   CATATAN — Spreadsheet ini JUGA sudah punya tab "Progres <Kecamatan>"
   per kecamatan (CAKUNG, CIPAYUNG, CIRACAS, DUREN SAWIT, JATINEGARA,
   KRAMAT JATI, dst.) — beda struktur dari asumsi 1 tab "Kecamatan"
   gabungan. BELUM dipakai loader manapun (built:false) — perlu
   dibicarakan dulu sebelum menu "Report Kecamatan" digarap di Fase 2,
   supaya loader dibuat cocok dengan struktur yang benar-benar ada ini.

   Fase ini HANYA memperbaiki & menyambungkan tab "Sheet1" (dipakai
   Halaman Utama) + menyiapkan tab "Log_Upload" (dipakai menu Upload).
   Tab lain (Kecamatan/Petugas/dst. versi ringkasan terpisah) SENGAJA
   belum disentuh — built:false — sesuai instruksi kamu untuk dikerjakan
   belakangan.
   ===================================================================== */
window.APP_CONFIG = {
  // ID Google Spreadsheet ("Master Data")
  sheetId: "1ptKJYzGM4OXmVspGgRT_X31uluEzko0dafCa6ZZjQDA",

  // Seberapa sering dashboard mengecek ulang data ke Google Sheet (detik)
  refreshSeconds: 45,

  // Nama tab persis seperti di Google Sheet — WAJIB sama persis (case-sensitive)
  tabs: {
    masterData: "Sheet1",        // tab data mentah per-SLS — sumber Halaman Utama
    logUpload: "Log_Upload",     // dibuat otomatis oleh Apps Script saat upload pertama

    // Belum aktif — akan diisi saat tab-tab ini benar-benar dibuat di Sheet.
    // Jangan dipakai loader manapun sebelum built:true di menuStatus di bawah.
    // CATATAN: sheet ini sudah punya tab "Progres <Kecamatan>" per kecamatan —
    // struktur ini beda dari 1 tab "Kecamatan" gabungan yang diasumsikan di
    // bawah; sesuaikan dulu sebelum mengaktifkan menu Report Kecamatan.
    ringkasan: "Ringkasan",
    trenMingguan: "Tren_Mingguan",
    kecamatan: "Kecamatan",
    usahaBesar: "UsahaBesar",
    petugas: "Petugas",
    kategoriPetugas: "KategoriPetugas",
    anomali: "Anomali"
  },

  // Urutan & nama 52 kolom persis seperti header baris 1 tab "Sheet1".
  // DIPAKAI DUA KALI:
  //  1) shared-loader.js tidak butuh ini untuk membaca (baca apa adanya),
  //  2) upload-data.html PAKAI ini untuk memvalidasi file Excel yang
  //     diunggah harus punya kolom sama persis (nama, jumlah, urutan)
  //     sebelum dikirim ke Google Sheet.
  masterDataColumns: [
    "IDSLS", "Kabko", "Kecamatan", "Kelurahan/Desa", "Nama SLS",
    "Email PPL", "Nama PPL", "Status", "Email PML", "Nama PML",
    "Prelist", "Assignment", "OPEN", "DRAFT",
    "SUBMITTED BY Pencacah", "SUBMITTED RESPONDENT",
    "REJECTED BY Pengawas", "REJECTED BY Admin Kabupaten",
    "REVOKED BY Pengawas", "REVOKED BY Admin Kabupaten",
    "EDITED BY Pengawas", "EDITED BY Admin Kabupaten",
    "APPROVED BY Pengawas", "COMPLETED BY Admin Kabupaten",
    "Prelist Usaha", "Jumlah Usaha BKU Ditemukan", "Jumlah Usaha BKU Tutup",
    "Jumlah Usaha BKU Ganda", "Jumlah Usaha BKU Tidak Ditemukan",
    "Persentase Usaha BKU Tidak Ditemukan", "Jumlah Usaha BKU Baru",
    "Persentase Usaha BKU Baru", "Jumlah Total Usaha BKU",
    "Persentase Total Usaha BKU", "Jumlah Usaha Keluarga Ditemukan",
    "Jumlah Usaha Keluarga Tutup", "Jumlah Usaha Keluarga Ganda",
    "Jumlah Usaha Keluarga Tidak Ditemukan", "Jumlah Usaha Keluarga Baru",
    "Jumlah Usaha Baru", "Jumlah Usaha BKU + Keluarga",
    "Persentase Usaha BKU + Keluarga", "Prelist Keluarga", "Ditemukan",
    "Keluarga Baru", "Meninggal", "Tidak Eligible",
    "Tidak Dapat Ditemui Sampai Akhir Pendataan", "Tidak Ditemukan",
    "Persentase Tidak Ditemukan", "Keluarga Khusus",
    "Total Hasil Pendataan Keluarga"
  ],

  // URL Google Apps Script Web App (menu Upload Data Terbaru).
  // Diisi 30 Jul 2026 — endpoint hasil deploy apps-script/Code.gs.
  // CATATAN: URL /exec ini aman untuk dipublikasikan di GitHub (repo publik
  // sekalipun) — akses sebenarnya dikontrol oleh UPLOAD_TOKEN yang tersimpan
  // di Script Properties Apps Script, BUKAN di URL ini. Jangan taruh
  // UPLOAD_TOKEN di file manapun yang ikut di-commit.
  uploadEndpoint: "https://script.google.com/macros/s/AKfycbzgtqQbdeLV9cUNo51S1SNuBgk6wuXzE6ldR3bX2-G1snO_zRkvyCruvCzCruIhaqnY/exec",

  // Status pembangunan tiap menu — dipakai shared-nav.js.
  menuStatus: {
    beranda: { href: "index.html", label: "Halaman Utama", built: true },
    kecamatan: { href: "report-kecamatan.html", label: "Report Kecamatan", built: false },
    usahaBesar: { href: "report-usaha-besar.html", label: "Report Usaha Besar", built: false },
    petugas: { href: "report-petugas.html", label: "Report Petugas", built: false },
    kategoriPetugas: { href: "report-kategori-petugas.html", label: "Report Kategori Petugas", built: false },
    anomali: { href: "report-anomali.html", label: "Report Anomali Pendataan", built: false },
    upload: { href: "upload-data.html", label: "Upload Data Terbaru", built: true }
  }
};
