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

   FASE INI (2 Agu 2026) — menu "Report Anomali Pendataan" diaktifkan:
   Sumbernya LIMA tabel Supabase (BUKAN view — tabel dasar hasil import
   terpisah dari workbook anomali Cahya). CATATAN INI SUDAH USANG per
   REVISI (2 Agu 2026, sore) — lihat revisi di bawah.

   REVISI (2 Agu 2026, sore) — kelima tabel dasar di atas DIGANTI lima
   VIEW baru (dibuat langsung di sisi Supabase), konsepnya berubah total
   dari "prelist vs assignment" jadi "hasil pendataan vs Wilkerstat" +
   "progres 0%", dan SEKARANG SUDAH menyertakan Nama & Email PPL/PML per
   baris (join sudah dilakukan di view, bukan di klien):
     - v_anomali_1_hasil_vs_wilkerstat : SEMUA SubSLS (tidak difilter),
       membandingkan hasil pendataan aktual (hasil_pendataan_keluarga,
       hasil_usaha_bku, hasil_usaha_total) dengan data acuan Wilkerstat
       (jumlah_kk_wilkerstat, jumlah_usaha_wilkerstat, dst.). Kolom
       selisih_keluarga & selisih_usaha sudah dihitung di view. Deteksi
       "anomali" (selisih di luar ambang, atau salah satu sisi kosong)
       TETAP dihitung di SISI KLIEN (report-anomali.html, konstanta
       GAP_PCT_KELUARGA / GAP_PCT_USAHA) — SESUAIKAN di sana kalau
       ambangnya berubah.
     - v_anomali_2_sls_progres_nol     : SLS dengan progres pendataan 0%
       (assignment ada, belum ada yang selesai) — SUDAH difilter di
       view (nama tabel berakhiran "_nol"), jadi SEMUA baris yang
       dikembalikan otomatis dianggap anomali di klien, tidak perlu
       hitung ulang.
     - v_anomali_3_muatan_ekonomi_nol  : SLS bermuatan usaha/ekonomi
       dengan progres 0 — SUDAH difilter di view, sama seperti di atas.
     - v_anomali_4_elit_progres_nol    : SLS permukiman elit dengan
       progres 0% — SUDAH difilter di view.
     - v_anomali_5_biasa_progres_nol   : SLS permukiman biasa dengan
       progres 0% — SUDAH difilter di view.
   Kalau definisi "progres 0%" atau ambang selisih Wilkerstat berubah,
   perbaiki di SQL view-nya (Supabase) untuk kategori 2-5 (karena
   filternya di server), atau di konstanta GAP_PCT_* di report-anomali.html
   untuk kategori 1 (karena filternya di klien). Menu ini HANYA
   berfungsi dengan dataSource:"supabase" (view murni Supabase, tidak
   ada padanan gviz/Google Sheets).

   FASE INI (2 Agu 2026, malam) — menu "Report Usaha Besar" diaktifkan:
   Sumbernya SATU tabel dasar + SATU tabel snapshot harian + TIGA view,
   semuanya baru & terpisah dari struktur SLS/Wilkerstat di atas (tabel
   ub_se2026_bps3172 tidak beririsan dengan sls_data):
     - ub_se2026_bps3172                 : kondisi terkini 1 baris/perusahaan
       (di-upsert). Dipakai LANGSUNG (bukan lewat view) hanya untuk
       menghitung baris "Belum Diproses" (ket_hasil IS NULL) per petugas
       di report-usaha-besar.html — SATU-SATUNYA query yang menyentuh
       tabel dasar ini secara langsung, dan hanya select("petugas,pml").
     - ub_se2026_bps3172_snapshot_harian : sama seperti di atas tapi
       append-only per hari — TIDAK dibaca langsung, sumber view
       v_progres_pegawai_harian.
     - v_progres_pegawai_harian   : progres per PPL & PML PER HARI, SUDAH
       difilter status='BPS Jakarta Timur' di view (bukan JIEP/STIS/dst).
       Dipakai Bagian 1 (tren + ringkasan harian).
     - v_progres_kategori_kecamatan : rekap kondisi terkini per kecamatan
       x status (BPS Jakarta Timur/JIEP/STIS/Rutinan/Data Kantor Pusat/RI),
       TIDAK difilter status — dipakai Bagian 2 (stacked bar + tabel).
     - v_detail_hasil_pendataan   : kondisi terkini per petugas x kode
       hasil (1-9, lihat ref_ket_hasil), TIDAK termasuk baris NULL
       (ket_hasil belum diisi) — itu sebabnya Bagian 3 menggabungkannya
       dengan hitungan NULL dari ub_se2026_bps3172 langsung (lihat di atas).
   Deskripsi kode ref_ket_hasil (1=DROP … 9=SUBMIT) di-hardcode di
   report-usaha-besar.html (KET_HASIL_ORDER) mengikuti definisi tetap yang
   diberikan Cahya — SESUAIKAN di sana kalau kode/deskripsinya berubah.
   Menu ini HANYA berfungsi dengan dataSource:"supabase" (tidak ada
   padanan di Google Sheets lama).

   FASE INI (3 Agu 2026) — menu "Progres Harian Petugas" diaktifkan:
   Sumbernya DUA view Supabase BARU, v_progres_ppl_harian &
   v_progres_pml_harian (lihat resume_progres_harian_ppl_pml.md) — SUDAH
   dibuat & dijalankan pengguna langsung di Supabase SQL Editor, loader
   di sini HANYA query, tidak membuat view apapun. Formulanya IDENTIK
   dengan v_progres_ppl / v_progres_pml yang dipakai "Report Petugas"
   (progres_pendataan_pct dari tabel sls_data, per PPL/PML per
   kecamatan) — bedanya kedua view baru ini berbasis sls_snapshot_harian
   (yang punya kolom tanggal), jadi hasilnya SATU BARIS PER PETUGAS PER
   HARI, plus dua kolom tambahan: delta_progres_pct (LAG harian per
   petugas) & status_progres ("DATA PERTAMA" / "ADA PROGRES" / "TIDAK
   ADA PROGRES" / "PERLU DICEK (turun)"). Tujuan menu ini SEMATA-MATA
   untuk memantau siapa yang TIDAK bergerak progresnya hari-ke-hari —
   BUKAN metrik baru, angka % Progres Pendataan pada tanggal terbaru
   akan selalu sama dengan yang tampil di "Report Petugas". Menu ini
   HANYA berfungsi dengan dataSource:"supabase" (tidak ada padanan di
   Google Sheets lama, sama seperti Report Petugas).
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
    },
    // Lima VIEW (bukan tabel dasar lagi) sumber menu "Report Anomali
    // Pendataan" (report-anomali.html) — lihat catatan revisi Fase 2
    // Agu 2026 di atas.
    anomali: {
      hasilVsWilkerstat: "v_anomali_1_hasil_vs_wilkerstat",
      slsProgresNol: "v_anomali_2_sls_progres_nol",
      muatanEkonomiNol: "v_anomali_3_muatan_ekonomi_nol",
      elitProgresNol: "v_anomali_4_elit_progres_nol",
      biasaProgresNol: "v_anomali_5_biasa_progres_nol"
    },

    // Report Usaha Besar (UB) — lihat catatan Fase "2 Agu 2026, malam" di
    // atas. ubMain dibaca LANGSUNG (bukan lewat view) hanya untuk hitung
    // baris "Belum Diproses" (ket_hasil IS NULL) per petugas di Bagian 3.
    usahaBesar: {
      ubMain: "ub_se2026_bps3172",
      ubSnapshotHarian: "ub_se2026_bps3172_snapshot_harian",
      progresPegawaiHarian: "v_progres_pegawai_harian",
      progresKategoriKecamatan: "v_progres_kategori_kecamatan",
      detailHasilPendataan: "v_detail_hasil_pendataan"
    },

    // Progres Harian Petugas (PPL & PML) — lihat catatan Fase "3 Agu 2026"
    // di bawah. Views v_progres_ppl_harian & v_progres_pml_harian:
    // formula IDENTIK dengan v_progres_ppl / v_progres_pml (tabel
    // sls_data, kondisi terkini), hanya ditambah dimensi tanggal (dari
    // sls_snapshot_harian) + delta harian (LAG per petugas). SUDAH
    // dibuat & dijalankan langsung di Supabase SQL Editor oleh
    // pengguna — loader di sini cukup query, tidak perlu CREATE VIEW.
    progresHarian: {
      ppl: "v_progres_ppl_harian",
      pml: "v_progres_pml_harian"
    }
  },

  // Status pembangunan tiap menu — dipakai shared-nav.js.
  menuStatus: {
    beranda: { href: "index.html", label: "Halaman Utama", built: true },
    kecamatan: { href: "report-kecamatan.html", label: "Report Kecamatan", built: true },
    usahaBesar: { href: "report-usaha-besar.html", label: "Report Usaha Besar", built: true },
    petugas: { href: "report-petugas.html", label: "Report Petugas", built: true },
    progresHarian: { href: "report-progres-harian.html", label: "Progres Harian Petugas", built: true },
    kategoriPetugas: { href: "report-kategori-petugas.html", label: "Report Kategori Petugas", built: true },
    anomali: { href: "report-anomali.html", label: "Report Anomali Pendataan", built: true },
    update: { href: "update-data.html", label: "Update Data", built: true }
  }
};
