/* =====================================================================
   SHARED-LOADER.JS
   Mesin generik pengambil data dari Google Sheet publik, dipakai ULANG
   oleh semua halaman menu. Tidak perlu API key — memakai endpoint
   publik gviz Google, sehingga Sheet cukup di-share
   "Anyone with the link — Viewer".

   TAMBAHAN (30 Jul 2026): fetchMasterData() + aggregateMasterData().
   Tab "Master Data" adalah data MENTAH per-SLS (1 baris = 1 SLS/RT),
   bukan data ringkasan siap-pakai. Jadi loader ini juga menghitung
   sendiri angka-angka KPI di sisi browser (client-side aggregation)
   dari 52 kolom mentahnya. Definisi tiap KPI ditulis eksplisit di
   aggregateMasterData() supaya gampang diaudit/diubah nanti begitu
   tab Ringkasan/Kecamatan/Petugas versi resmi sudah ada.
   ===================================================================== */
(function () {

  // ---- util angka & format ala Indonesia ----
  function toNum(v) {
    if (v === undefined || v === null || v === "") return 0;
    const n = parseFloat(String(v).replace(/,/g, "."));
    return isNaN(n) ? 0 : n;
  }
  function fmtID(n, decimals) {
    const num = Number(n) || 0;
    return num.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function yesNo(v) {
    return /^(ya|y|true|yes|1)$/i.test(String(v || "").trim());
  }

  // ---- parser CSV yang tahan koma/kutip/baris-baru di dalam sel ----
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], next = text[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') { field += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { field += c; }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ",") { row.push(field); field = ""; }
        else if (c === "\r") { /* skip */ }
        else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
        else { field += c; }
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.some(cell => String(cell).trim() !== ""));
  }

  function rowsToObjects(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map(h => String(h).trim());
    return rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? String(r[i]).trim() : ""; });
      return obj;
    });
  }

  // ---- ambil satu tab sebagai array of objects (via nama tab) ----
  async function fetchTab(sheetId, tabName) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Gagal mengambil tab "${tabName}" (HTTP ${res.status}). Pastikan nama tab benar & Sheet sudah di-share publik.`);
    }
    const text = await res.text();
    if (/^<!DOCTYPE html/i.test(text.trim())) {
      throw new Error(`Tab "${tabName}" tidak ditemukan, atau Sheet belum di-share "Anyone with the link".`);
    }
    return rowsToObjects(parseCSV(text));
  }

  // ---- helper khusus untuk tab bertipe Key/Value (mis. tab Ringkasan, saat sudah ada) ----
  function rowsToKV(rows) {
    const kv = {};
    rows.forEach(r => {
      const key = (r.Key || r.key || "").trim();
      if (key) kv[key] = r.Value !== undefined ? r.Value : r.value;
    });
    return {
      get(key, fallback) {
        return kv[key] !== undefined && kv[key] !== "" ? kv[key] : fallback;
      },
      getNum(key, fallback) {
        const v = kv[key];
        return v !== undefined && v !== "" ? toNum(v) : fallback;
      }
    };
  }

  // ---- ambil tab "Master Data" (data mentah per-SLS) ----
  async function fetchMasterData(sheetId, tabName) {
    return fetchTab(sheetId, tabName);
  }

  /* ---------------------------------------------------------------------
     aggregateMasterData(rows)
     Menghitung semua angka yang dipakai Halaman Utama dari data mentah
     per-SLS. DEFINISI (asumsi awal — beri tahu aku kalau perlu diubah
     setelah tab Ringkasan/Petugas/Anomali resmi tersedia):

     - target usaha didata   = SUM(kolom "Prelist Usaha")
     - usaha sudah terdata   = SUM(kolom "Jumlah Usaha BKU + Keluarga")
     - petugas aktif         = jumlah "Nama PPL" unik & tidak kosong
     - anomali belum ditindaklanjuti
                              = jumlah BARIS yang punya nilai persentase
                                di luar rentang wajar 0-100% pada salah
                                satu dari 5 kolom persentase (indikasi
                                data BKU/Keluarga salah input) — mengikuti
                                pola deteksi otomatis Opsi B di rancangan.
     - progres per kecamatan = SUM(Prelist Usaha) vs SUM(Jumlah Usaha
                                BKU + Keluarga), dikelompokkan per kolom
                                "Kecamatan"
     - status pendataan SLS  = jumlah baris per kategori status alur
                                kerja (OPEN/DRAFT/SUBMITTED/APPROVED/dst.),
                                dipakai sebagai pengganti "tren mingguan"
                                karena tab mentah ini tidak punya kolom
                                tanggal/minggu untuk dibuat tren asli.
     --------------------------------------------------------------------- */
  function aggregateMasterData(rows) {
    const PCT_COLS = [
      "Persentase Usaha BKU Tidak Ditemukan",
      "Persentase Usaha BKU Baru",
      "Persentase Total Usaha BKU",
      "Persentase Usaha BKU + Keluarga",
      "Persentase Tidak Ditemukan"
    ];
    const STATUS_COLS = [
      "OPEN", "DRAFT", "SUBMITTED BY Pencacah", "SUBMITTED RESPONDENT",
      "REJECTED BY Pengawas", "REJECTED BY Admin Kabupaten",
      "REVOKED BY Pengawas", "REVOKED BY Admin Kabupaten",
      "EDITED BY Pengawas", "EDITED BY Admin Kabupaten",
      "APPROVED BY Pengawas", "COMPLETED BY Admin Kabupaten"
    ];

    let target = 0, terdata = 0;
    const petugasSet = new Set();
    let anomaliCount = 0;
    const statusTotals = {};
    STATUS_COLS.forEach(c => { statusTotals[c] = 0; });
    const kecMap = new Map(); // Kecamatan -> { target, terdata }

    rows.forEach(r => {
      const prelistUsaha = toNum(r["Prelist Usaha"]);
      const bkuKeluarga = toNum(r["Jumlah Usaha BKU + Keluarga"]);
      target += prelistUsaha;
      terdata += bkuKeluarga;

      const ppl = (r["Nama PPL"] || "").trim();
      if (ppl) petugasSet.add(ppl);

      const isAnomali = PCT_COLS.some(col => {
        const v = toNum(r[col]);
        return v > 100 || v < 0;
      });
      if (isAnomali) anomaliCount++;

      STATUS_COLS.forEach(c => { statusTotals[c] += toNum(r[c]); });

      const kec = (r["Kecamatan"] || "Tanpa Kecamatan").replace(/^\[\d+\]\s*/, "").trim();
      if (!kecMap.has(kec)) kecMap.set(kec, { target: 0, terdata: 0 });
      const kecEntry = kecMap.get(kec);
      kecEntry.target += prelistUsaha;
      kecEntry.terdata += bkuKeluarga;
    });

    const pct = target > 0 ? Math.round((terdata / target) * 1000) / 10 : 0;

    const kecamatan = Array.from(kecMap.entries()).map(([nama, v]) => ({
      Kelurahan: nama,
      Persentase: v.target > 0 ? Math.round((v.terdata / v.target) * 1000) / 10 : 0
    })).sort((a, b) => b.Persentase - a.Persentase);

    return {
      kv: {
        get: () => "—",
        getNum: (key) => ({
          total_usaha_target: target,
          total_usaha_terdata: terdata,
          pct_progress: pct,
          total_petugas: petugasSet.size,
          total_anomali_terbuka: anomaliCount
        }[key] || 0)
      },
      summary: {
        target, terdata, pct,
        totalPetugas: petugasSet.size,
        totalAnomali: anomaliCount,
        totalSLS: rows.length
      },
      kecamatan,
      statusTotals,
      statusOrder: STATUS_COLS
    };
  }

  // Ekspor fungsi-fungsi ini supaya dipakai oleh setiap halaman menu
  window.SheetEngine = {
    fetchTab, fetchMasterData, aggregateMasterData,
    rowsToObjects, rowsToKV, parseCSV, toNum, fmtID, yesNo
  };

})();
