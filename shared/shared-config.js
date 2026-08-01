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

   Fase sebelumnya HANYA memperbaiki & menyambungkan tab "Sheet1" (dipakai
   Halaman Utama) + menyiapkan tab "Log_Upload" (dipakai menu Upload).
   Tab lain (Kecamatan/Petugas/dst. versi ringkasan terpisah) SENGAJA
   belum disentuh — built:false.

   FASE INI (31 Jul 2026) — menu "Report Kategori Petugas" diaktifkan:
   Sumbernya BUKAN "Sheet1" (data mentah), melainkan workbook TERPISAH
   "Sumber_Data_Chart_Monitoring_SE2026_Jaktim" (lihat chartSourceSheetId
   di bawah), tab "06_Kategori_Petugas_Kota" (Gambar 5 & 6 — performa &
   distribusi per kategori petugas se-kota) dan "07_Heatmap_Selesai_
   KecxKategori" (Gambar 7 — heatmap % selesai per kecamatan x kategori).
   Nama kedua tab ini sudah dikonfirmasi lewat daftar sheet "00_Panduan"
   pada workbook tsb. Menu lain (Kecamatan/Usaha Besar/Anomali)
   TETAP built:false — belum digarap fase ini.

   FASE BERIKUTNYA (1 Agu 2026) — menu "Report Petugas" diaktifkan:
   Sumbernya view Supabase v_progres_ppl & v_progres_pml (lihat
   supabase_view_progres_petugas.sql) — progres pendataan per PPL/PML per
   kecamatan, dipakai sebagai dasar pembayaran termin. Ambang 40% pada
   kolom progres_pendataan_pct dipakai report-petugas.html untuk menandai
   status "Belum Bisa Dibayar Termin 1" — SESUAIKAN di report-petugas.html
   (konstanta THRESHOLD_PCT) kalau angka/kolom acuannya berubah. Menu ini
   HANYA berfungsi dengan dataSource:"supabase" (view ini tidak ada
   padanannya di struktur Google Sheets lama, jadi tidak ada fallback gviz).

   FASE INI (1 Agu 2026, lanjutan) — menu "Report Kecamatan" diaktifkan:
   Sumbernya view Supabase v_progres_kelurahan (lihat
   tambahan_view_progres_kelurahan.sql) — 1 baris per Kelurahan/Desa,
   dikelompokkan di bawah Kecamatan induknya. Formula progresnya PERSIS
   SAMA dengan v_progres_kecamatan ("tanpa Draft" & "termasuk Draft" /
   Assignment, pct_usaha, pct_keluarga) — hanya level pengelompokannya
   lebih rinci (kecamatan -> kelurahan). Baris dengan is_unknown=true
   (kode Kabko 3172000 / kecamatan belum terklasifikasi) DIKECUALIKAN
   dari tampilan & rata-rata default, sama semangatnya dengan baris
   "Tidak Diketahui" di Halaman Utama — bisa dimunculkan lewat toggle
   di report-kecamatan.html. Menu ini HANYA berfungsi dengan
   dataSource:"supabase" (tidak ada padanan di Google Sheets lama, tab
   "Progres <Kecamatan>" per kecamatan yang disebut di catatan lama di
   atas TIDAK dipakai — sudah digantikan view Supabase ini).

   FASE INI (1 Agu 2026, lanjutan lagi) — menu "Upload Data Terbaru"
   DIGANTI "Update Data" (upload-data.html -> update-data.html):
   Sejak migrasi ke Supabase, dashboard ini tidak lagi punya jalur upload
   Excel -> Apps Script -> Google Sheet (endpoint uploadEndpoint, kolom
   masterDataColumns, tab Log_Upload — SEMUA sudah dihapus dari file ini,
   lihat riwayat git kalau perlu pola lama). Update data mentah SEKARANG
   dilakukan LANGSUNG di sisi Supabase (Table Editor / SQL Editor / script
   impor terpisah) — bukan lagi lewat dashboard. Menu baru "Update Data"
   HANYA menampilkan status/riwayatnya secara read-only, dibaca dari tabel
   data_sync_log (lihat sql/data_sync_log.sql — WAJIB dijalankan sekali di
   Supabase SQL Editor sebelum menu ini bisa menampilkan riwayat) + hitung
   baris langsung dari view yang sudah ada (v_sls_data_public, dst.) untuk
   ringkasan "kondisi data saat ini". Menu ini JUGA hanya berfungsi dengan
   dataSource:"supabase", sama seperti Report Petugas & Report Kecamatan.
   ===================================================================== */
window.APP_CONFIG = {
  // ---------------------------------------------------------------------
  // MIGRASI SUPABASE (lihat rancangan-migrasi-database-se2026.md, Fase 2).
  // "supabase"  -> Halaman Utama & Report Kategori Petugas baca dari Supabase.
  // "gviz"      -> perilaku LAMA, baca dari Google Sheets (rollback 1 baris).
  // Selama masa uji paralel, ganti nilai ini saja untuk bandingkan kedua
  // sumber — tidak perlu revert kode.
  // ---------------------------------------------------------------------
  dataSource: "supabase",

  // Diisi setelah project Supabase dibuat (Fase 0) & supabase_schema.sql
  // dijalankan. anonKey AMAN dipublikasikan di kode client-side selama RLS
  // sudah aktif (lihat §4 supabase_schema.sql) — JANGAN pernah isi
  // service_role key di sini.
  supabaseUrl: "https://obdzkwxxktozkpcijofq.supabase.co",       // contoh: "https://xxxxxxxx.supabase.co"
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZHprd3h4a3RvemtwY2lqb2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NjYyMzAsImV4cCI6MjEwMTE0MjIzMH0.xu_PZhvFN4BHPEXu8BmDUmP4BlAHX3i4K_J3g07J2wA",   // anon public key dari Project Settings > API

  // ID Google Spreadsheet ("Master Data") — dipakai Halaman Utama & Upload.
  // Dipertahankan sebagai fallback/rollback (Fase 4: baru dihapus setelah
  // stabil >1-2 minggu di Supabase, sesuai §7 rancangan).
  sheetId: "1ptKJYzGM4OXmVspGgRT_X31uluEzko0dafCa6ZZjQDA",

  // ID Google Spreadsheet KEDUA — workbook terpisah "Sumber Data Chart"
  // ("Sumber_Data_Chart_Monitoring_SE2026_Jaktim"), BUKAN spreadsheet yang
  // sama dengan sheetId di atas. Workbook ini berisi tab 00-09 siap-pakai
  // (dihitung via SUMIFS dari tab Data_Mentah/Bantu_Hitung_BA_BK di workbook
  // yang sama) — masing-masing 1:1 dengan Gambar/Tabel pada Laporan
  // Monitoring SE2026 posisi 31 Juli 2026. Dipakai menu-menu Report yang
  // butuh angka ringkasan siap pakai, BUKAN data mentah per-SLS.
  // Diisi 31 Jul 2026 berdasarkan link yang dibagikan langsung ke workbook ini.
  chartSourceSheetId: "1sOeAxZZlmHsvdWQssAYVEoup6fPAwvnG7UPZK0kW7Bg",

  // Seberapa sering dashboard mengecek ulang data ke Google Sheet (detik)
  refreshSeconds: 45,

  // Nama tab persis seperti di Google Sheet — WAJIB sama persis (case-sensitive)
  tabs: {
    masterData: "Sheet1",        // tab data mentah per-SLS — sumber Halaman Utama (fallback gviz saja)

    // ---- Tab di workbook KEDUA (chartSourceSheetId), sudah dikonfirmasi
    // namanya lewat daftar sheet "00_Panduan" workbook tsb per 31 Jul 2026 ----
    kategoriPetugasKota: "06_Kategori_Petugas_Kota",         // sumber Gambar 5 & 6 — dipakai menu Report Kategori Petugas
    heatmapKecKategori: "07_Heatmap_Selesai_KecxKategori",   // sumber Gambar 7 — dipakai menu Report Kategori Petugas

    // Belum aktif — akan diisi/dicocokkan saat menu terkait mulai digarap.
    // Jangan dipakai loader manapun sebelum built:true di menuStatus di bawah.
    // CATATAN: workbook KEDUA juga sudah punya tab 01_Rekap_Kecamatan,
    // 02_Komposisi_Status_Kec, 03_Ranking_Selesai_Kec, 04_Ranking_Rejected_Kec,
    // 05_Beban_Kec_x_Kategori, 08_Prelist_Keluarga_Kec, 09_Tren_Mingguan —
    // relevan untuk menu Report Kecamatan & Report Anomali nanti, sesuaikan
    // nama tab di sini saat menu itu digarap (jangan menebak seperti sebelumnya).
    ringkasan: "01_Rekap_Kecamatan",
    trenMingguan: "09_Tren_Mingguan",
    kecamatan: "01_Rekap_Kecamatan",
    usahaBesar: "UsahaBesar",
    petugas: "Petugas",
    anomali: "Anomali"
  },

  // Nama tabel/view Supabase yang dibaca menu "Update Data"
  // (update-data.html) untuk ringkasan kondisi data & riwayat update.
  // dataSyncLog: tabel BARU, harus dibuat dulu lewat sql/data_sync_log.sql
  // (dijalankan sekali di Supabase SQL Editor) — lihat catatan Fase di
  // atas. countViews: view yang SUDAH ADA (dipakai loader lain), dibaca
  // ulang di sini hanya untuk hitung jumlah baris (COUNT), bukan datanya.
  supabaseTables: {
    dataSyncLog: "data_sync_log",
    countViews: {
      slsData: "v_sls_data_public",
      progresPpl: "v_progres_ppl",
      progresPml: "v_progres_pml",
      progresKelurahan: "v_progres_kelurahan",
      kategoriPetugas: "v_kategori_petugas_kota"
    }
  },

  // Status pembangunan tiap menu — dipakai shared-nav.js.
  menuStatus: {
    beranda: { href: "index.html", label: "Halaman Utama", built: true },
    kecamatan: { href: "report-kecamatan.html", label: "Report Kecamatan", built: true },
    usahaBesar: { href: "report-usaha-besar.html", label: "Report Usaha Besar", built: false },
    petugas: { href: "report-petugas.html", label: "Report Petugas", built: true },
    kategoriPetugas: { href: "report-kategori-petugas.html", label: "Report Kategori Petugas", built: true },
    anomali: { href: "report-anomali.html", label: "Report Anomali Pendataan", built: false },
    update: { href: "update-data.html", label: "Update Data", built: true }
  }
};
