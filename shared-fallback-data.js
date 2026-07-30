/* =====================================================================
   SHARED-FALLBACK-DATA.JS
   Data contoh dipakai HANYA jika Google Sheet gagal diakses (belum
   di-share publik, tab belum ada, dsb) — supaya halaman tidak pernah
   tampil kosong/error. Begitu Sheet tersambung, data asli akan
   menggantikan ini secara otomatis.
   ===================================================================== */
window.FALLBACK_DATA = {

  // Tab: Ringkasan (Key, Value)
  ringkasan: {
    total_usaha_target: 48500,
    total_usaha_terdata: 31280,
    pct_progress: 64.5,
    total_petugas: 210,
    total_anomali_terbuka: 17,
    catatan: "Data contoh — sambungkan Google Sheet untuk melihat progres SE2026 yang sebenarnya."
  },

  // Tab: Tren_Mingguan (Minggu, Persentase)
  trenMingguan: {
    labels: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
    vals: [8, 17, 24, 33, 41, 50, 57, 64.5]
  },

  // Tab: Kecamatan — dipakai untuk pratinjau mini "peta progres kecamatan" di Halaman Utama
  // (rincian penuh akan ada di menu Report Kecamatan, Fase 2)
  kecamatan: [
    { Kelurahan: "Matraman", Persentase: 71 },
    { Kelurahan: "Pulogadung", Persentase: 66 },
    { Kelurahan: "Jatinegara", Persentase: 58 },
    { Kelurahan: "Cakung", Persentase: 49 },
    { Kelurahan: "Duren Sawit", Persentase: 73 },
    { Kelurahan: "Kramat Jati", Persentase: 62 },
    { Kelurahan: "Makasar", Persentase: 55 },
    { Kelurahan: "Pasar Rebo", Persentase: 68 },
    { Kelurahan: "Ciracas", Persentase: 60 },
    { Kelurahan: "Cipayung", Persentase: 45 }
  ]
};
