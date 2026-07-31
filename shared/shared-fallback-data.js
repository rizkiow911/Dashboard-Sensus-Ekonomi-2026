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
  unknown: { Kelurahan: "Tidak Diketahui", assignment: 620, progresExclDraft: null, progresInclDraft: null, Target: 108, Terdata: 196, Persentase: 181.5, TargetKeluarga: 0, HasilKeluarga: 0, PersentaseKeluarga: 0, usahaKeluargaDidata: 0, usahaKeluargaPct: 0 }
};
