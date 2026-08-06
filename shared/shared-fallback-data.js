/* =====================================================================
   SHARED-FALLBACK-DATA.JS
   Data contoh dipakai HANYA jika Google Sheet gagal diakses (belum
   di-share publik, tab belum ada, dsb) — supaya halaman tidak pernah
   tampil kosong/error. Begitu Sheet tersambung, data asli akan
   menggantikan ini secara otomatis.

   REVISI 30 Jul 2026 — disesuaikan dengan struktur baru shared-loader.js
   (progres FASIH Tabel B/C, usaha dalam keluarga setara Tabel E, dan
   baris "Tidak Diketahui" yang dipisah dari daftar kecamatan).
   ===================================================================== */
window.FALLBACK_DATA = {

  ringkasan: {
    prelist: 1165320,
    assignment: 1290985,
    progres_excl_draft: 62.4,
    progres_incl_draft: 69.3,
    total_usaha_target: 48500,
    total_usaha_terdata: 31280,
    pct_progress: 64.5,
    total_petugas: 210,
    total_anomali_terbuka: 17,
    total_sls: 980,
    usaha_ditemukan: 24200,
    usaha_baru: 7080,
    usaha_tutup: 1150,
    usaha_ganda: 260,
    usaha_tidak_ditemukan: 3400,
    keluarga_prelist: 871196,
    keluarga_hasil: 611000,
    keluarga_pct: 70.1,
    usaha_keluarga_didata: 68982,
    usaha_keluarga_pct: 7.9,
    catatan: "Data contoh — sambungkan Google Sheet untuk melihat progres SE2026 yang sebenarnya."
  },

  // Dipakai untuk chart "Distribusi status pendataan SLS" saat mode demo.
  statusTotals: {
    "OPEN": 120, "DRAFT": 340, "SUBMITTED BY Pencacah": 610,
    "SUBMITTED RESPONDENT": 280, "REJECTED BY Pengawas": 45,
    "REJECTED BY Admin Kabupaten": 12, "REVOKED BY Pengawas": 8,
    "REVOKED BY Admin Kabupaten": 3, "EDITED BY Pengawas": 96,
    "EDITED BY Admin Kabupaten": 21, "APPROVED BY Pengawas": 890,
    "COMPLETED BY Admin Kabupaten": 640
  },
  statusOrder: [
    "OPEN", "DRAFT", "SUBMITTED BY Pencacah", "SUBMITTED RESPONDENT",
    "REJECTED BY Pengawas", "REJECTED BY Admin Kabupaten",
    "REVOKED BY Pengawas", "REVOKED BY Admin Kabupaten",
    "EDITED BY Pengawas", "EDITED BY Admin Kabupaten",
    "APPROVED BY Pengawas", "COMPLETED BY Admin Kabupaten"
  ],

  // Tab: Kecamatan — 10 kecamatan definitif (baris "Tidak Diketahui"
  // TIDAK dimasukkan di sini, ditaruh terpisah di bawah, sesuai laporan resmi)
  kecamatan: [
    { Kelurahan: "Cakung", assignment: 234866, progresExclDraft: 65.4, progresInclDraft: 73.9, Target: 7800, Terdata: 3822, Persentase: 49, TargetKeluarga: 160249, HasilKeluarga: 111000, PersentaseKeluarga: 69.3, usahaKeluargaDidata: 16611, usahaKeluargaPct: 10.4 },
    { Kelurahan: "Matraman", assignment: 75511, progresExclDraft: 64.9, progresInclDraft: 71.2, Target: 4200, Terdata: 2982, Persentase: 71, TargetKeluarga: 51008, HasilKeluarga: 35500, PersentaseKeluarga: 69.6, usahaKeluargaDidata: 3910, usahaKeluargaPct: 7.7 },
    { Kelurahan: "Jatinegara", assignment: 125260, progresExclDraft: 63.8, progresInclDraft: 69.8, Target: 5900, Terdata: 3422, Persentase: 58, TargetKeluarga: 84582, HasilKeluarga: 58200, PersentaseKeluarga: 68.8, usahaKeluargaDidata: 8158, usahaKeluargaPct: 9.6 },
    { Kelurahan: "Ciracas", assignment: 133720, progresExclDraft: 63.5, progresInclDraft: 69.8, Target: 3700, Terdata: 2220, Persentase: 60, TargetKeluarga: 86326, HasilKeluarga: 59300, PersentaseKeluarga: 68.7, usahaKeluargaDidata: 6605, usahaKeluargaPct: 7.7 },
    { Kelurahan: "Makasar", assignment: 85301, progresExclDraft: 63.5, progresInclDraft: 69.1, Target: 3100, Terdata: 1705, Persentase: 55, TargetKeluarga: 58273, HasilKeluarga: 40100, PersentaseKeluarga: 68.8, usahaKeluargaDidata: 4346, usahaKeluargaPct: 7.5 },
    { Kelurahan: "Pulo Gadung", assignment: 126715, progresExclDraft: 62.6, progresInclDraft: 68.7, Target: 6300, Terdata: 4158, Persentase: 66, TargetKeluarga: 81247, HasilKeluarga: 55700, PersentaseKeluarga: 68.6, usahaKeluargaDidata: 5358, usahaKeluargaPct: 6.6 },
    { Kelurahan: "Duren Sawit", assignment: 169672, progresExclDraft: 61.4, progresInclDraft: 68.9, Target: 6100, Terdata: 4453, Persentase: 73, TargetKeluarga: 116984, HasilKeluarga: 79900, PersentaseKeluarga: 68.3, usahaKeluargaDidata: 7761, usahaKeluargaPct: 6.6 },
    { Kelurahan: "Pasar Rebo", assignment: 86034, progresExclDraft: 59.8, progresInclDraft: 69.3, Target: 2800, Terdata: 1904, Persentase: 68, TargetKeluarga: 62504, HasilKeluarga: 42800, PersentaseKeluarga: 68.5, usahaKeluargaDidata: 3490, usahaKeluargaPct: 5.6 },
    { Kelurahan: "Kramat Jati", assignment: 131504, progresExclDraft: 59.4, progresInclDraft: 65.0, Target: 3900, Terdata: 2418, Persentase: 62, TargetKeluarga: 86839, HasilKeluarga: 59500, PersentaseKeluarga: 68.5, usahaKeluargaDidata: 7783, usahaKeluargaPct: 9.0 },
    { Kelurahan: "Cipayung", assignment: 122402, progresExclDraft: 57.9, progresInclDraft: 64.3, Target: 4700, Terdata: 2115, Persentase: 45, TargetKeluarga: 83184, HasilKeluarga: 57000, PersentaseKeluarga: 68.5, usahaKeluargaDidata: 4960, usahaKeluargaPct: 6.0 }
  ],

  // Baris "Tidak Diketahui" (kode 3172000) — dipisah dari daftar & peringkat
  // di atas karena bukan wilayah kecamatan definitif; progres seringkali >100%
  // karena lag ETL / belum terklasifikasi.
  unknown: { Kelurahan: "Tidak Diketahui", assignment: 620, progresExclDraft: null, progresInclDraft: null, Target: 108, Terdata: 196, Persentase: 181.5, TargetKeluarga: 0, HasilKeluarga: 0, PersentaseKeluarga: 0, usahaKeluargaDidata: 0, usahaKeluargaPct: 0 },

  /* =====================================================================
     DATA CONTOH — menu "Report Kategori Petugas" (tab 06 & 07 di workbook
     "Sumber_Data_Chart_Monitoring_SE2026_Jaktim"). Angka di bawah ini
     BUKAN acak — disalin persis dari Laporan Monitoring SE2026 posisi
     31 Juli 2026 Bagian 7 (Tabel 7.1 & Gambar 7), supaya mode demo tetap
     terasa masuk akal sebelum Sheet tersambung.
     ===================================================================== */

  // Tab "06_Kategori_Petugas_Kota" — sumber Gambar 5 & 6 (Bagian 7.1)
  kategoriPetugasKota: [
    { kategori: "STIS", totalBeban: 405510, petugas: 500, pctSelesai: 65.35, pctApproved: 57.37 },
    { kategori: "UMUM", totalBeban: 755049, petugas: 939, pctSelesai: 63.26, pctApproved: 56.19 },
    { kategori: "AFIRMASI", totalBeban: 58117, petugas: 75, pctSelesai: 57.65, pctApproved: 47.00 },
    { kategori: "SAINTEK", totalBeban: 70732, petugas: 95, pctSelesai: 54.42, pctApproved: 49.22 }
  ],

  // Tab "07_Heatmap_Selesai_KecxKategori" — sumber Gambar 7 (Bagian 7.2).
  // null = kategori tidak beroperasi di kecamatan tsb ("-" pada laporan).
  heatmapKecKategori: {
    categories: ["STIS", "UMUM", "SAINTEK", "AFIRMASI"],
    rows: [
      { kecamatan: "Cakung",      cells: { STIS: 67.3, UMUM: 66.0, SAINTEK: 42.6, AFIRMASI: 49.0 } },
      { kecamatan: "Matraman",    cells: { STIS: 69.8, UMUM: 63.3, SAINTEK: null, AFIRMASI: 72.5 } },
      { kecamatan: "Ciracas",     cells: { STIS: 60.3, UMUM: 68.0, SAINTEK: 57.7, AFIRMASI: 74.2 } },
      { kecamatan: "Jatinegara",  cells: { STIS: 72.6, UMUM: 60.5, SAINTEK: null, AFIRMASI: 55.8 } },
      { kecamatan: "Makasar",     cells: { STIS: 63.9, UMUM: 65.0, SAINTEK: 58.9, AFIRMASI: 64.5 } },
      { kecamatan: "Pulo Gadung", cells: { STIS: 61.0, UMUM: 64.6, SAINTEK: null, AFIRMASI: 56.3 } },
      { kecamatan: "Duren Sawit", cells: { STIS: 62.5, UMUM: 62.4, SAINTEK: null, AFIRMASI: 54.5 } },
      { kecamatan: "Pasar Rebo",  cells: { STIS: 59.2, UMUM: 63.5, SAINTEK: 53.1, AFIRMASI: 65.2 } },
      { kecamatan: "Kramat Jati", cells: { STIS: 68.9, UMUM: 57.3, SAINTEK: 79.9, AFIRMASI: 46.2 } },
      { kecamatan: "Cipayung",    cells: { STIS: 56.7, UMUM: 61.8, SAINTEK: 50.7, AFIRMASI: 58.3 } }
    ]
  },

  // Report Petugas — dari view v_progres_ppl & v_progres_pml. Contoh kecil
  // (2 kecamatan) saja, cukup untuk memperlihatkan bentuk tabel & status
  // pembayaran ambang 40% saat Supabase belum tersambung.
  // Catatan: "Gilang Ramadhan" (PPL) & "Hana Permata" (PML) di bawah ini
  // SENGAJA dibuat duplikat 2 baris dengan email SAMA tapi kecamatan
  // BEDA — contoh kasus 1 petugas yang wilayah tugasnya lintas kecamatan.
  // Dipakai untuk menguji mergeDuplicatePetugas() di report-petugas.html
  // waktu Supabase belum tersambung (mode demo).
  petugasProgres: {
    ppl: [
      { kecamatan: "Matraman", nama: "Andi Saputra", email: "andi.saputra@bps.go.id", jumlahSls: 12, prelist: 480, hasilPendataan: 410, progresPendataanPct: 85.4, prelistUsaha: 90, hasilUsahaBku: 76, progresUsahaBkuPct: 84.4, hasilUsahaRumahTangga: 55, prelistKeluarga: 480, hasilPendataanKeluarga: 400, progresKeluargaPct: 83.3 },
      { kecamatan: "Matraman", nama: "Budi Santoso", email: "budi.santoso@bps.go.id", jumlahSls: 10, prelist: 400, hasilPendataan: 120, progresPendataanPct: 30.0, prelistUsaha: 70, hasilUsahaBku: 18, progresUsahaBkuPct: 25.7, hasilUsahaRumahTangga: 12, prelistKeluarga: 400, hasilPendataanKeluarga: 110, progresKeluargaPct: 27.5 },
      { kecamatan: "Cakung", nama: "Citra Dewi", email: "citra.dewi@bps.go.id", jumlahSls: 14, prelist: 560, hasilPendataan: 300, progresPendataanPct: 53.6, prelistUsaha: 100, hasilUsahaBku: 58, progresUsahaBkuPct: 58.0, hasilUsahaRumahTangga: 40, prelistKeluarga: 560, hasilPendataanKeluarga: 290, progresKeluargaPct: 51.8 },
      { kecamatan: "Cakung", nama: "Dedi Firmansyah", email: "dedi.firmansyah@bps.go.id", jumlahSls: 11, prelist: 440, hasilPendataan: 90, progresPendataanPct: 20.5, prelistUsaha: 80, hasilUsahaBku: 15, progresUsahaBkuPct: 18.8, hasilUsahaRumahTangga: 9, prelistKeluarga: 440, hasilPendataanKeluarga: 85, progresKeluargaPct: 19.3 },
      { kecamatan: "Matraman", nama: "Gilang Ramadhan", email: "gilang.ramadhan@bps.go.id", jumlahSls: 6, prelist: 240, hasilPendataan: 100, progresPendataanPct: 41.7, prelistUsaha: 45, hasilUsahaBku: 20, progresUsahaBkuPct: 44.4, hasilUsahaRumahTangga: 14, prelistKeluarga: 240, hasilPendataanKeluarga: 96, progresKeluargaPct: 40.0 },
      { kecamatan: "Cakung", nama: "Gilang Ramadhan", email: "gilang.ramadhan@bps.go.id", jumlahSls: 5, prelist: 200, hasilPendataan: 70, progresPendataanPct: 35.0, prelistUsaha: 38, hasilUsahaBku: 12, progresUsahaBkuPct: 31.6, hasilUsahaRumahTangga: 9, prelistKeluarga: 200, hasilPendataanKeluarga: 65, progresKeluargaPct: 32.5 }
    ],
    pml: [
      { kecamatan: "Matraman", nama: "Eka Wijaya", email: "eka.wijaya@bps.go.id", jumlahPetugas: 2, jumlahSls: 22, prelist: 880, hasilPendataan: 460, progresPendataanPct: 52.3, prelistUsaha: 160, hasilUsahaBku: 82, progresUsahaBkuPct: 51.3, hasilUsahaRumahTangga: 60, prelistKeluarga: 880, hasilPendataanKeluarga: 450, progresKeluargaPct: 51.1 },
      { kecamatan: "Cakung", nama: "Fajar Nugroho", email: "fajar.nugroho@bps.go.id", jumlahPetugas: 2, jumlahSls: 25, prelist: 1000, hasilPendataan: 350, progresPendataanPct: 35.0, prelistUsaha: 180, hasilUsahaBku: 62, progresUsahaBkuPct: 34.4, hasilUsahaRumahTangga: 44, prelistKeluarga: 1000, hasilPendataanKeluarga: 340, progresKeluargaPct: 34.0 },
      { kecamatan: "Matraman", nama: "Hana Permata", email: "hana.permata@bps.go.id", jumlahPetugas: 1, jumlahSls: 10, prelist: 400, hasilPendataan: 150, progresPendataanPct: 37.5, prelistUsaha: 70, hasilUsahaBku: 24, progresUsahaBkuPct: 34.3, hasilUsahaRumahTangga: 18, prelistKeluarga: 400, hasilPendataanKeluarga: 145, progresKeluargaPct: 36.3 },
      { kecamatan: "Cakung", nama: "Hana Permata", email: "hana.permata@bps.go.id", jumlahPetugas: 1, jumlahSls: 9, prelist: 360, hasilPendataan: 120, progresPendataanPct: 33.3, prelistUsaha: 64, hasilUsahaBku: 20, progresUsahaBkuPct: 31.3, hasilUsahaRumahTangga: 15, prelistKeluarga: 360, hasilPendataanKeluarga: 118, progresKeluargaPct: 32.8 }
    ]
  },

  // Progres Harian Petugas — dari view v_progres_ppl_harian &
  // v_progres_pml_harian (lihat resume_progres_harian_ppl_pml.md).
  // Contoh kecil (2 kecamatan, 3 hari) saja, cukup untuk memperlihatkan
  // bentuk tabel, status_progres, delta harian, & tren per petugas saat
  // Supabase belum tersambung.
  petugasProgresHarian: {
    ppl: [
      { tanggal: "2026-08-01", kecamatan: "Matraman", nama: "Andi Saputra", email: "andi.saputra@bps.go.id", jumlahSls: 12, prelist: 480, hasilPendataan: 200, progresPendataanPct: 41.7, deltaProgresPct: null, statusProgres: "DATA PERTAMA" },
      { tanggal: "2026-08-02", kecamatan: "Matraman", nama: "Andi Saputra", email: "andi.saputra@bps.go.id", jumlahSls: 12, prelist: 480, hasilPendataan: 300, progresPendataanPct: 62.5, deltaProgresPct: 20.8, statusProgres: "ADA PROGRES" },
      { tanggal: "2026-08-03", kecamatan: "Matraman", nama: "Andi Saputra", email: "andi.saputra@bps.go.id", jumlahSls: 12, prelist: 480, hasilPendataan: 410, progresPendataanPct: 85.4, deltaProgresPct: 22.9, statusProgres: "ADA PROGRES" },

      { tanggal: "2026-08-01", kecamatan: "Matraman", nama: "Budi Santoso", email: "budi.santoso@bps.go.id", jumlahSls: 10, prelist: 400, hasilPendataan: 90, progresPendataanPct: 22.5, deltaProgresPct: null, statusProgres: "DATA PERTAMA" },
      { tanggal: "2026-08-02", kecamatan: "Matraman", nama: "Budi Santoso", email: "budi.santoso@bps.go.id", jumlahSls: 10, prelist: 400, hasilPendataan: 90, progresPendataanPct: 22.5, deltaProgresPct: 0, statusProgres: "TIDAK ADA PROGRES" },
      { tanggal: "2026-08-03", kecamatan: "Matraman", nama: "Budi Santoso", email: "budi.santoso@bps.go.id", jumlahSls: 10, prelist: 400, hasilPendataan: 120, progresPendataanPct: 30.0, deltaProgresPct: 7.5, statusProgres: "ADA PROGRES" },

      { tanggal: "2026-08-01", kecamatan: "Cakung", nama: "Citra Dewi", email: "citra.dewi@bps.go.id", jumlahSls: 14, prelist: 560, hasilPendataan: 250, progresPendataanPct: 44.6, deltaProgresPct: null, statusProgres: "DATA PERTAMA" },
      { tanggal: "2026-08-02", kecamatan: "Cakung", nama: "Citra Dewi", email: "citra.dewi@bps.go.id", jumlahSls: 14, prelist: 560, hasilPendataan: 310, progresPendataanPct: 55.4, deltaProgresPct: 10.8, statusProgres: "ADA PROGRES" },
      { tanggal: "2026-08-03", kecamatan: "Cakung", nama: "Citra Dewi", email: "citra.dewi@bps.go.id", jumlahSls: 14, prelist: 560, hasilPendataan: 300, progresPendataanPct: 53.6, deltaProgresPct: -1.8, statusProgres: "PERLU DICEK (turun)" },

      { tanggal: "2026-08-01", kecamatan: "Cakung", nama: "Dedi Firmansyah", email: "dedi.firmansyah@bps.go.id", jumlahSls: 11, prelist: 440, hasilPendataan: 60, progresPendataanPct: 13.6, deltaProgresPct: null, statusProgres: "DATA PERTAMA" },
      { tanggal: "2026-08-02", kecamatan: "Cakung", nama: "Dedi Firmansyah", email: "dedi.firmansyah@bps.go.id", jumlahSls: 11, prelist: 440, hasilPendataan: 60, progresPendataanPct: 13.6, deltaProgresPct: 0, statusProgres: "TIDAK ADA PROGRES" },
      { tanggal: "2026-08-03", kecamatan: "Cakung", nama: "Dedi Firmansyah", email: "dedi.firmansyah@bps.go.id", jumlahSls: 11, prelist: 440, hasilPendataan: 90, progresPendataanPct: 20.5, deltaProgresPct: 6.9, statusProgres: "ADA PROGRES" }
    ],
    pml: [
      { tanggal: "2026-08-01", kecamatan: "Matraman", nama: "Eka Wijaya", email: "eka.wijaya@bps.go.id", jumlahPetugas: 2, jumlahSls: 22, prelist: 880, hasilPendataan: 290, progresPendataanPct: 33.0, deltaProgresPct: null, statusProgres: "DATA PERTAMA" },
      { tanggal: "2026-08-02", kecamatan: "Matraman", nama: "Eka Wijaya", email: "eka.wijaya@bps.go.id", jumlahPetugas: 2, jumlahSls: 22, prelist: 880, hasilPendataan: 390, progresPendataanPct: 44.3, deltaProgresPct: 11.3, statusProgres: "ADA PROGRES" },
      { tanggal: "2026-08-03", kecamatan: "Matraman", nama: "Eka Wijaya", email: "eka.wijaya@bps.go.id", jumlahPetugas: 2, jumlahSls: 22, prelist: 880, hasilPendataan: 460, progresPendataanPct: 52.3, deltaProgresPct: 8.0, statusProgres: "ADA PROGRES" },

      { tanggal: "2026-08-01", kecamatan: "Cakung", nama: "Fajar Nugroho", email: "fajar.nugroho@bps.go.id", jumlahPetugas: 2, jumlahSls: 25, prelist: 1000, hasilPendataan: 310, progresPendataanPct: 31.0, deltaProgresPct: null, statusProgres: "DATA PERTAMA" },
      { tanggal: "2026-08-02", kecamatan: "Cakung", nama: "Fajar Nugroho", email: "fajar.nugroho@bps.go.id", jumlahPetugas: 2, jumlahSls: 25, prelist: 1000, hasilPendataan: 370, progresPendataanPct: 37.0, deltaProgresPct: 6.0, statusProgres: "ADA PROGRES" },
      { tanggal: "2026-08-03", kecamatan: "Cakung", nama: "Fajar Nugroho", email: "fajar.nugroho@bps.go.id", jumlahPetugas: 2, jumlahSls: 25, prelist: 1000, hasilPendataan: 350, progresPendataanPct: 35.0, deltaProgresPct: -2.0, statusProgres: "PERLU DICEK (turun)" }
    ]
  },

  // Report Kecamatan — dari view v_progres_kelurahan (1 baris per
  // Kelurahan/Desa, dikelompokkan di bawah Kecamatan induknya). Contoh
  // kecil (3 kecamatan + 1 baris "Tidak Diketahui") saja, cukup untuk
  // memperlihatkan bentuk tabel & tab kecamatan saat Supabase belum
  // tersambung.
  kelurahanProgres: [
    { kecamatan: "Matraman", kelurahan: "Kebon Manggis", isUnknown: false, jumlahSls: 18, assignment: 21400, prelist: 19800, progresExclDraftPct: 68.2, progresInclDraftPct: 74.6, targetUsaha: 780, terdataUsaha: 560, progresUsahaPct: 71.8, targetKeluarga: 14600, hasilKeluarga: 10100, progresKeluargaPct: 69.2, usahaTidakDitemukan: 38, rumahTanggaTidakDitemukan: 210 },
    { kecamatan: "Matraman", kelurahan: "Bali Mester", isUnknown: false, jumlahSls: 14, assignment: 16250, prelist: 14900, progresExclDraftPct: 61.5, progresInclDraftPct: 68.9, targetUsaha: 610, terdataUsaha: 372, progresUsahaPct: 61.0, targetKeluarga: 11200, hasilKeluarga: 7600, progresKeluargaPct: 67.9, usahaTidakDitemukan: 29, rumahTanggaTidakDitemukan: 165 },
    { kecamatan: "Matraman", kelurahan: "Pisangan Baru", isUnknown: false, jumlahSls: 12, assignment: 13100, prelist: 12000, progresExclDraftPct: 34.8, progresInclDraftPct: 41.2, targetUsaha: 520, terdataUsaha: 149, progresUsahaPct: 28.7, targetKeluarga: 9100, hasilKeluarga: 4300, progresKeluargaPct: 47.3, usahaTidakDitemukan: 41, rumahTanggaTidakDitemukan: 260 },
    { kecamatan: "Cakung", kelurahan: "Jatinegara Kaum", isUnknown: false, jumlahSls: 22, assignment: 28700, prelist: 26400, progresExclDraftPct: 58.9, progresInclDraftPct: 66.1, targetUsaha: 940, terdataUsaha: 512, progresUsahaPct: 54.5, targetKeluarga: 19500, hasilKeluarga: 13100, progresKeluargaPct: 67.2, usahaTidakDitemukan: 52, rumahTanggaTidakDitemukan: 340 },
    { kecamatan: "Cakung", kelurahan: "Rawa Terate", isUnknown: false, jumlahSls: 16, assignment: 19850, prelist: 18200, progresExclDraftPct: 47.6, progresInclDraftPct: 55.0, targetUsaha: 700, terdataUsaha: 289, progresUsahaPct: 41.3, targetKeluarga: 13400, hasilKeluarga: 8200, progresKeluargaPct: 61.2, usahaTidakDitemukan: 44, rumahTanggaTidakDitemukan: 290 },
    { kecamatan: "Cakung", kelurahan: "Penggilingan", isUnknown: false, jumlahSls: 20, assignment: 25100, prelist: 23000, progresExclDraftPct: 25.4, progresInclDraftPct: 33.7, targetUsaha: 860, terdataUsaha: 158, progresUsahaPct: 18.4, targetKeluarga: 17000, hasilKeluarga: 6900, progresKeluargaPct: 40.6, usahaTidakDitemukan: 61, rumahTanggaTidakDitemukan: 410 },
    { kecamatan: "Duren Sawit", kelurahan: "Malaka Jaya", isUnknown: false, jumlahSls: 15, assignment: 17900, prelist: 16400, progresExclDraftPct: 71.4, progresInclDraftPct: 77.9, targetUsaha: 650, terdataUsaha: 498, progresUsahaPct: 76.6, targetKeluarga: 12300, hasilKeluarga: 9200, progresKeluargaPct: 74.8, usahaTidakDitemukan: 33, rumahTanggaTidakDitemukan: 190 },
    { kecamatan: "Duren Sawit", kelurahan: "Klender", isUnknown: false, jumlahSls: 19, assignment: 22600, prelist: 20700, progresExclDraftPct: 55.1, progresInclDraftPct: 62.3, targetUsaha: 810, terdataUsaha: 402, progresUsahaPct: 49.6, targetKeluarga: 15600, hasilKeluarga: 10300, progresKeluargaPct: 66.0, usahaTidakDitemukan: 47, rumahTanggaTidakDitemukan: 300 },
    { kecamatan: "Duren Sawit", kelurahan: "Pondok Kelapa", isUnknown: false, jumlahSls: 17, assignment: 20450, prelist: 18700, progresExclDraftPct: 39.6, progresInclDraftPct: 46.8, targetUsaha: 730, terdataUsaha: 233, progresUsahaPct: 31.9, targetKeluarga: 14100, hasilKeluarga: 7500, progresKeluargaPct: 53.2, usahaTidakDitemukan: 50, rumahTanggaTidakDitemukan: 330 },
    { kecamatan: "Tidak Diketahui", kelurahan: "Tidak Diketahui", isUnknown: true, jumlahSls: 6, assignment: 620, prelist: 540, progresExclDraftPct: 118.4, progresInclDraftPct: 126.7, targetUsaha: 108, terdataUsaha: 196, progresUsahaPct: 181.5, targetKeluarga: 0, hasilKeluarga: 0, progresKeluargaPct: 0, usahaTidakDitemukan: 9, rumahTanggaTidakDitemukan: 0 }
  ],

  // Report Anomali Pendataan — dari 5 VIEW Supabase (revisi 2 Agu 2026
  // sore, lihat catatan di shared-config.js): v_anomali_1_hasil_vs_wilkerstat
  // (semua SubSLS) + v_anomali_2..5_..._nol (sudah difilter progres/muatan=0
  // di view). Contoh kecil saja (2 kecamatan), cukup memperlihatkan bentuk
  // tabel, kolom PPL/PML, & bendera anomali di setiap kategori saat
  // Supabase belum tersambung.
  anomaliPendataan: {
    // SEMUA SubSLS (tidak difilter) — status anomali dihitung di klien
    // dari selisihKeluarga/selisihUsaha (lihat statusHasilVsWilkerstat
    // di report-anomali.html).
    hasilVsWilkerstat: [
      { idSubsls: "3172010001001", kecamatan: "Matraman", kelurahan: "Kebon Manggis", namaSls: "RT 001/RW 001", namaPpl: "Andi Saputra", emailPpl: "andi.saputra@bps.go.id", namaPml: "Eka Wijaya", emailPml: "eka.wijaya@bps.go.id", jumlahKkWilkerstat: 62, jumlahUsahaWilkerstat: 4, jumlahMuatanWilkerstat: 66, jumlahBsttWilkerstat: 58, hasilPendataanKeluarga: 60, hasilUsahaBku: 4, hasilUsahaTotal: 4, selisihKeluarga: -2, selisihUsaha: 0 },
      { idSubsls: "3172010001002", kecamatan: "Matraman", kelurahan: "Kebon Manggis", namaSls: "RT 002/RW 001", namaPpl: "Budi Santoso", emailPpl: "budi.santoso@bps.go.id", namaPml: "Eka Wijaya", emailPml: "eka.wijaya@bps.go.id", jumlahKkWilkerstat: 55, jumlahUsahaWilkerstat: 2, jumlahMuatanWilkerstat: 57, jumlahBsttWilkerstat: 50, hasilPendataanKeluarga: 0, hasilUsahaBku: 0, hasilUsahaTotal: 0, selisihKeluarga: -55, selisihUsaha: -2 },
      { idSubsls: "3172010002005", kecamatan: "Matraman", kelurahan: "Bali Mester", namaSls: "RT 005/RW 002", namaPpl: "Budi Santoso", emailPpl: "budi.santoso@bps.go.id", namaPml: "Eka Wijaya", emailPml: "eka.wijaya@bps.go.id", jumlahKkWilkerstat: 40, jumlahUsahaWilkerstat: 18, jumlahMuatanWilkerstat: 58, jumlahBsttWilkerstat: 12, hasilPendataanKeluarga: 38, hasilUsahaBku: 17, hasilUsahaTotal: 17, selisihKeluarga: -2, selisihUsaha: -1 },
      { idSubsls: "3171020003011", kecamatan: "Cakung", kelurahan: "Jatinegara Kaum", namaSls: "RT 011/RW 003", namaPpl: "Citra Dewi", emailPpl: "citra.dewi@bps.go.id", namaPml: "Fajar Nugroho", emailPml: "fajar.nugroho@bps.go.id", jumlahKkWilkerstat: 34, jumlahUsahaWilkerstat: 2, jumlahMuatanWilkerstat: 36, jumlahBsttWilkerstat: 30, hasilPendataanKeluarga: 33, hasilUsahaBku: 2, hasilUsahaTotal: 2, selisihKeluarga: -1, selisihUsaha: 0 }
    ],

    // SUDAH difilter progres=0 di view — SEMUA baris di sini dianggap anomali di klien.
    slsProgresNol: [
      { idSubsls: "3172010001010", kecamatan: "Matraman", kelurahan: "Kebon Manggis", namaSls: "RT 010/RW 002", namaPpl: "Dedi Firmansyah", emailPpl: "dedi.firmansyah@bps.go.id", namaPml: "Eka Wijaya", emailPml: "eka.wijaya@bps.go.id", prelist: 42, assignment: 42, open: 42 },
      { idSubsls: "3171020003033", kecamatan: "Cakung", kelurahan: "Jatinegara Kaum", namaSls: "RT 033/RW 006", namaPpl: "Citra Dewi", emailPpl: "citra.dewi@bps.go.id", namaPml: "Fajar Nugroho", emailPml: "fajar.nugroho@bps.go.id", prelist: 18, assignment: 18, open: 18 }
    ],

    // SUDAH difilter (muatan ekonomi ada tapi progres 0) di view.
    muatanEkonomiNol: [
      { idSubsls: "3172010002021", kecamatan: "Matraman", kelurahan: "Bali Mester", namaSls: "RT 021/RW 004", namaPpl: "Budi Santoso", emailPpl: "budi.santoso@bps.go.id", namaPml: "Eka Wijaya", emailPml: "eka.wijaya@bps.go.id", jumlahUsahaWilkerstat: 18, jumlahMuatanWilkerstat: 30, jenisMuatanDominan: "Usaha/Ekonomi" }
    ],

    // SUDAH difilter progres=0 di view, khusus permukiman elit.
    elitProgresNol: [
      { idSubsls: "3171020003012", kecamatan: "Cakung", kelurahan: "Jatinegara Kaum", namaSls: "RT 012/RW 003", namaPpl: "Citra Dewi", emailPpl: "citra.dewi@bps.go.id", namaPml: "Fajar Nugroho", emailPml: "fajar.nugroho@bps.go.id", jenisMuatanDominan: "Permukiman Elite", assignment: 20, open: 20 }
    ],

    // SUDAH difilter progres=0 di view, khusus permukiman biasa.
    biasaProgresNol: [
      { idSubsls: "3172010001002b", kecamatan: "Matraman", kelurahan: "Kebon Manggis", namaSls: "RT 002/RW 001", namaPpl: "Budi Santoso", emailPpl: "budi.santoso@bps.go.id", namaPml: "Eka Wijaya", emailPml: "eka.wijaya@bps.go.id", jenisMuatanDominan: "Permukiman Biasa", assignment: 55, open: 55 },
      { idSubsls: "3171020007040", kecamatan: "Cakung", kelurahan: "Jatinegara Kaum", namaSls: "RT 040/RW 007", namaPpl: "Dedi Firmansyah", emailPpl: "dedi.firmansyah@bps.go.id", namaPml: "Fajar Nugroho", emailPml: "fajar.nugroho@bps.go.id", jenisMuatanDominan: "Permukiman Biasa", assignment: 46, open: 46 }
    ]
  },

  // Report Usaha Besar (UB) — lihat catatan Fase "2 Agu 2026, malam" &
  // PERBAIKAN 3 Agu 2026 di shared-config.js / shared-supabase-loader.js.
  // Contoh kecil saja (2 PML x 2 PPL Non-JIEP + 1 PML x 2 PPL JIEP, 4
  // hari, 3 kecamatan), cukup memperlihatkan bentuk tren, tab kategori,
  // progres (%), & matrix hasil saat Supabase belum tersambung.
  usahaBesarUB: {
    // Bagian 1 — v_progres_pegawai_harian (SEMUA asal alokasi, termasuk
    // JIEP & Rutinan — lihat PERBAIKAN 3 Agu 2026). "status" = asal
    // alokasi UB; "kategoriPetugas" diturunkan darinya (JIEP/Non JIEP),
    // sama seperti kategoriPetugasFromStatus() di shared-supabase-loader.js.
    pegawaiHarian: [
      { tanggalSnapshot: "2026-07-30", petugas: "Andi Saputra", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 18, submit: 4, sudahDiproses: 6, belumDiproses: 12, persenSubmit: 22.2 },
      { tanggalSnapshot: "2026-07-30", petugas: "Budi Santoso", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 15, submit: 2, sudahDiproses: 3, belumDiproses: 12, persenSubmit: 13.3 },
      { tanggalSnapshot: "2026-07-30", petugas: "Citra Dewi", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 20, submit: 5, sudahDiproses: 8, belumDiproses: 12, persenSubmit: 25.0 },
      { tanggalSnapshot: "2026-07-30", petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 16, submit: 3, sudahDiproses: 5, belumDiproses: 11, persenSubmit: 18.8 },
      { tanggalSnapshot: "2026-07-30", petugas: "Eko Prasetyo", pml: "Gita Lestari", status: "JIEP", kategoriPetugas: "JIEP", totalAlokasi: 22, submit: 3, sudahDiproses: 5, belumDiproses: 17, persenSubmit: 13.6 },
      { tanggalSnapshot: "2026-07-30", petugas: "Fitri Handayani", pml: "Gita Lestari", status: "Rutinan", kategoriPetugas: "JIEP", totalAlokasi: 14, submit: 2, sudahDiproses: 3, belumDiproses: 11, persenSubmit: 14.3 },

      { tanggalSnapshot: "2026-07-31", petugas: "Andi Saputra", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 18, submit: 7, sudahDiproses: 10, belumDiproses: 8, persenSubmit: 38.9 },
      { tanggalSnapshot: "2026-07-31", petugas: "Budi Santoso", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 15, submit: 4, sudahDiproses: 6, belumDiproses: 9, persenSubmit: 26.7 },
      { tanggalSnapshot: "2026-07-31", petugas: "Citra Dewi", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 20, submit: 9, sudahDiproses: 13, belumDiproses: 7, persenSubmit: 45.0 },
      { tanggalSnapshot: "2026-07-31", petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 16, submit: 5, sudahDiproses: 8, belumDiproses: 8, persenSubmit: 31.3 },
      { tanggalSnapshot: "2026-07-31", petugas: "Eko Prasetyo", pml: "Gita Lestari", status: "JIEP", kategoriPetugas: "JIEP", totalAlokasi: 22, submit: 6, sudahDiproses: 9, belumDiproses: 13, persenSubmit: 27.3 },
      { tanggalSnapshot: "2026-07-31", petugas: "Fitri Handayani", pml: "Gita Lestari", status: "Rutinan", kategoriPetugas: "JIEP", totalAlokasi: 14, submit: 4, sudahDiproses: 6, belumDiproses: 8, persenSubmit: 28.6 },

      { tanggalSnapshot: "2026-08-01", petugas: "Andi Saputra", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 18, submit: 10, sudahDiproses: 14, belumDiproses: 4, persenSubmit: 55.6 },
      { tanggalSnapshot: "2026-08-01", petugas: "Budi Santoso", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 15, submit: 5, sudahDiproses: 8, belumDiproses: 7, persenSubmit: 33.3 },
      { tanggalSnapshot: "2026-08-01", petugas: "Citra Dewi", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 20, submit: 13, sudahDiproses: 17, belumDiproses: 3, persenSubmit: 65.0 },
      { tanggalSnapshot: "2026-08-01", petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 16, submit: 7, sudahDiproses: 10, belumDiproses: 6, persenSubmit: 43.8 },
      { tanggalSnapshot: "2026-08-01", petugas: "Eko Prasetyo", pml: "Gita Lestari", status: "JIEP", kategoriPetugas: "JIEP", totalAlokasi: 22, submit: 9, sudahDiproses: 13, belumDiproses: 9, persenSubmit: 40.9 },
      { tanggalSnapshot: "2026-08-01", petugas: "Fitri Handayani", pml: "Gita Lestari", status: "Rutinan", kategoriPetugas: "JIEP", totalAlokasi: 14, submit: 6, sudahDiproses: 8, belumDiproses: 6, persenSubmit: 42.9 },

      { tanggalSnapshot: "2026-08-02", petugas: "Andi Saputra", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 18, submit: 13, sudahDiproses: 16, belumDiproses: 2, persenSubmit: 72.2 },
      { tanggalSnapshot: "2026-08-02", petugas: "Budi Santoso", pml: "Eka Wijaya", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 15, submit: 6, sudahDiproses: 9, belumDiproses: 6, persenSubmit: 40.0 },
      { tanggalSnapshot: "2026-08-02", petugas: "Citra Dewi", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 20, submit: 16, sudahDiproses: 19, belumDiproses: 1, persenSubmit: 80.0 },
      { tanggalSnapshot: "2026-08-02", petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", status: "BPS Jakarta Timur", kategoriPetugas: "Non JIEP", totalAlokasi: 16, submit: 8, sudahDiproses: 12, belumDiproses: 4, persenSubmit: 50.0 },
      { tanggalSnapshot: "2026-08-02", petugas: "Eko Prasetyo", pml: "Gita Lestari", status: "JIEP", kategoriPetugas: "JIEP", totalAlokasi: 22, submit: 12, sudahDiproses: 16, belumDiproses: 6, persenSubmit: 54.5 },
      { tanggalSnapshot: "2026-08-02", petugas: "Fitri Handayani", pml: "Gita Lestari", status: "Rutinan", kategoriPetugas: "JIEP", totalAlokasi: 14, submit: 8, sudahDiproses: 10, belumDiproses: 4, persenSubmit: 57.1 }
    ],

    // Bagian 2 — v_progres_kategori_kecamatan (semua status, tidak
    // difilter). jumlahSelesai/jumlahBelum: lihat PERBAIKAN 3 Agu 2026 —
    // dipakai untuk tampilan "Progres (%)" (default). Angka contoh
    // dibuat wajar (belum tentu = submit, karena "selesai" mencakup
    // semua kode ket_hasil 1-9).
    kategoriKecamatan: [
      { kecamatan: "Matraman", status: "BPS Jakarta Timur", jumlah: 18, jumlahSelesai: 11, jumlahBelum: 7 },
      { kecamatan: "Matraman", status: "JIEP", jumlah: 6, jumlahSelesai: 3, jumlahBelum: 3 },
      { kecamatan: "Matraman", status: "STIS", jumlah: 3, jumlahSelesai: 2, jumlahBelum: 1 },
      { kecamatan: "Matraman", status: "Rutinan", jumlah: 4, jumlahSelesai: 2, jumlahBelum: 2 },
      { kecamatan: "Matraman", status: "Data Kantor Pusat", jumlah: 2, jumlahSelesai: 1, jumlahBelum: 1 },
      { kecamatan: "Matraman", status: "RI", jumlah: 1, jumlahSelesai: 1, jumlahBelum: 0 },
      { kecamatan: "Cakung", status: "BPS Jakarta Timur", jumlah: 36, jumlahSelesai: 14, jumlahBelum: 22 },
      { kecamatan: "Cakung", status: "JIEP", jumlah: 42, jumlahSelesai: 19, jumlahBelum: 23 },
      { kecamatan: "Cakung", status: "STIS", jumlah: 5, jumlahSelesai: 3, jumlahBelum: 2 },
      { kecamatan: "Cakung", status: "Rutinan", jumlah: 7, jumlahSelesai: 3, jumlahBelum: 4 },
      { kecamatan: "Cakung", status: "Data Kantor Pusat", jumlah: 3, jumlahSelesai: 1, jumlahBelum: 2 },
      { kecamatan: "Cakung", status: "RI", jumlah: 2, jumlahSelesai: 1, jumlahBelum: 1 },
      { kecamatan: "Duren Sawit", status: "BPS Jakarta Timur", jumlah: 15, jumlahSelesai: 12, jumlahBelum: 3 },
      { kecamatan: "Duren Sawit", status: "JIEP", jumlah: 4, jumlahSelesai: 3, jumlahBelum: 1 },
      { kecamatan: "Duren Sawit", status: "STIS", jumlah: 2, jumlahSelesai: 2, jumlahBelum: 0 },
      { kecamatan: "Duren Sawit", status: "Rutinan", jumlah: 5, jumlahSelesai: 4, jumlahBelum: 1 },
      { kecamatan: "Duren Sawit", status: "Data Kantor Pusat", jumlah: 1, jumlahSelesai: 1, jumlahBelum: 0 },
      { kecamatan: "Duren Sawit", status: "RI", jumlah: 1, jumlahSelesai: 1, jumlahBelum: 0 }
    ],

    // Bagian 3 — v_detail_hasil_pendataan (kode 1-9, TIDAK termasuk NULL)
    // digabung dengan belumDiproses (dihitung dari ub_se2026_bps3172
    // langsung, ket_hasil IS NULL).
    detailHasil: {
      detail: [
        { petugas: "Andi Saputra", pml: "Eka Wijaya", ketHasil: 9, deskripsi: "SUBMIT (SUDAH ENTRI)", jumlah: 13 },
        { petugas: "Andi Saputra", pml: "Eka Wijaya", ketHasil: 2, deskripsi: "TIDAK DITEMUKAN", jumlah: 2 },
        { petugas: "Andi Saputra", pml: "Eka Wijaya", ketHasil: 4, deskripsi: "MENOLAK", jumlah: 1 },
        { petugas: "Budi Santoso", pml: "Eka Wijaya", ketHasil: 9, deskripsi: "SUBMIT (SUDAH ENTRI)", jumlah: 6 },
        { petugas: "Budi Santoso", pml: "Eka Wijaya", ketHasil: 5, deskripsi: "PINDAH", jumlah: 2 },
        { petugas: "Budi Santoso", pml: "Eka Wijaya", ketHasil: 1, deskripsi: "DROP", jumlah: 1 },
        { petugas: "Citra Dewi", pml: "Fajar Nugroho", ketHasil: 9, deskripsi: "SUBMIT (SUDAH ENTRI)", jumlah: 16 },
        { petugas: "Citra Dewi", pml: "Fajar Nugroho", ketHasil: 3, deskripsi: "DOUBLE", jumlah: 1 },
        { petugas: "Citra Dewi", pml: "Fajar Nugroho", ketHasil: 8, deskripsi: "DOKUMEN MASUK", jumlah: 2 },
        { petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", ketHasil: 9, deskripsi: "SUBMIT (SUDAH ENTRI)", jumlah: 8 },
        { petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", ketHasil: 6, deskripsi: "MINTA CAWI", jumlah: 2 },
        { petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", ketHasil: 7, deskripsi: "DATA DARI HASIL KKD RI", jumlah: 2 }
      ],
      belumDiproses: [
        { petugas: "Andi Saputra", pml: "Eka Wijaya", jumlah: 2 },
        { petugas: "Budi Santoso", pml: "Eka Wijaya", jumlah: 6 },
        { petugas: "Citra Dewi", pml: "Fajar Nugroho", jumlah: 1 },
        { petugas: "Dedi Firmansyah", pml: "Fajar Nugroho", jumlah: 4 }
      ]
    }
  }
};
