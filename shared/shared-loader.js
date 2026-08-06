/* =====================================================================
   SHARED-LOADER.JS
   Mesin generik pengambil data dari Google Sheet publik, dipakai ULANG
   oleh semua halaman menu. Tidak perlu API key — memakai endpoint
   publik gviz Google, sehingga Sheet cukup di-share
   "Anyone with the link — Viewer".

   REVISI 30 Jul 2026 — perbaikan akurasi setelah dibandingkan langsung
   dengan format "Laporan Harian SE2026" resmi:

   1) toNum() lama salah membaca angka format Indonesia. Ia hanya
      mengubah koma -> titik, sehingga nilai seperti "197.244" (titik
      sebagai pemisah ribuan) dibaca sebagai 197.244 (dua ratus koma
      sekian) — bukan 197244. Ini bisa membuat SEMUA angka besar
      (Prelist, Assignment, dst.) terpotong drastis kalau selnya
      berupa teks berformat ID, bukan angka murni. Diperbaiki dengan
      parser format-ID yang lebih aman.

   2) Definisi "progres" versi lama (Prelist Usaha vs Jumlah Usaha
      BKU + Keluarga) TIDAK cocok dengan definisi manapun yang dipakai
      Laporan Harian resmi (Tabel A = Dashboard SE2026, Tabel B/C =
      Database FASIH). Sekarang dihitung definisi Tabel B & Tabel C
      yang sebenarnya, langsung dari kolom status (OPEN/DRAFT/dst.)
      yang memang sudah ada di Sheet1 — dengan Assignment sebagai
      penyebut ("sudah dialokasikan"), persis seperti catatan kaki
      laporan resmi.

   3) Baris "Tidak Diketahui" (kode 3172000) SELALU tampil >100% pada
      data resmi (kemungkinan lag ETL / belum terklasifikasi) dan pada
      Laporan Harian resmi baris ini SENGAJA dipisah dari peringkat
      kecamatan. Versi lama menyatukannya ke daftar kecamatan biasa,
      sehingga bisa lolos jadi "kecamatan tercepat" di peringkat —
      salah satu sumber utama keluhan "data tidak akurat". Sekarang
      baris ini dideteksi & dikeluarkan dari peringkat, ditampilkan
      terpisah sebagai catatan (persis pola Laporan Harian resmi).

   4) Rincian usaha (ditemukan/baru/tutup/ganda/tidak ditemukan) yang
      dulu digabung BKU+Keluarga menjadi satu, sekarang dipisah — sisi
      Keluarga dipakai untuk menghitung "Usaha dalam Keluarga" (setara
      Tabel E laporan resmi), sisi BKU dipakai untuk komposisi usaha
      an sich (semangat Tabel D, tanpa rincian skala UB/UMKM karena
      kolom skala usaha itu memang belum ada di Sheet1 — lihat catatan
      built:false pada usahaBesar di shared-config.js).
   ===================================================================== */
(function () {

  // ---- parser angka format Indonesia yang aman terhadap titik ribuan ----
  function toNum(v) {
    if (v === undefined || v === null || v === "") return 0;
    let s = String(v).trim();
    if (s === "") return 0;
    const negative = /^-/.test(s) || /^\(.*\)$/.test(s);
    s = s.replace(/[^0-9.,]/g, ""); // buang %, spasi, "Rp", tanda kurung, dsb.
    if (s === "") return 0;

    const hasDot = s.indexOf(".") !== -1;
    const hasComma = s.indexOf(",") !== -1;

    if (hasDot && hasComma) {
      // format ID lengkap, mis. "1.234.567,89" -> titik = ribuan, koma = desimal
      s = s.replace(/\./g, "").replace(",", ".");
    } else if (hasComma && !hasDot) {
      // koma sebagai desimal, mis. "64,3"
      s = s.replace(",", ".");
    } else if (hasDot && !hasComma) {
      // ambigu: "197.244" (ribuan) vs "64.3" (desimal). Heuristik: kalau
      // setiap kelompok setelah titik pertama persis 3 digit dan kelompok
      // pertama <=3 digit, ini pola ribuan ID -> gabungkan.
      const parts = s.split(".");
      const looksLikeThousands = parts.length > 1 && parts.slice(1).every(p => p.length === 3) && parts[0].length <= 3;
      if (looksLikeThousands) s = parts.join("");
      // selain itu dibiarkan (titik desimal biasa)
    }
    const n = parseFloat(s);
    if (isNaN(n)) return 0;
    return negative ? -Math.abs(n) : n;
  }

  function fmtID(n, decimals) {
    const num = Number(n) || 0;
    return num.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function yesNo(v) {
    return /^(ya|y|true|yes|1)$/i.test(String(v || "").trim());
  }
  function pct(numerator, denominator) {
    if (!denominator) return 0;
    return Math.round((numerator / denominator) * 1000) / 10;
  }

  // ---- parser CSV yang tahan koma/kutip/baris-baru di dalam sel ----
  // keepBlankRows: true -> baris kosong TIDAK dibuang, supaya indeks baris
  // hasil parse tetap persis sama dengan nomor baris asli di Google Sheet.
  // Dipakai saat header tabel bukan di baris pertama (mis. ada judul/banner
  // di atas tabel) -> lihat rowsToObjectsFrom() & param headerRow di fetchTab().
  function parseCSV(text, keepBlankRows) {
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
    return keepBlankRows ? rows : rows.filter(r => r.some(cell => String(cell).trim() !== ""));
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

  // ---- versi rowsToObjects yang headernya bisa di baris ke-N (1-indexed,
  // sesuai nomor baris yang terlihat di Google Sheet) alih-alih selalu
  // baris pertama. `rows` di sini HARUS hasil parseCSV(text, true) (baris
  // kosong tetap ada) supaya headerRowIndex cocok dengan nomor baris asli. ----
  function rowsToObjectsFrom(rows, headerRowIndex /* 0-indexed */) {
    if (rows.length <= headerRowIndex) return [];
    const headers = rows[headerRowIndex].map(h => String(h).trim());
    return rows.slice(headerRowIndex + 1)
      .filter(r => r.some(cell => String(cell).trim() !== ""))
      .map(r => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? String(r[i]).trim() : ""; });
        return obj;
      });
  }

  // ---- ambil satu tab sebagai array of objects (via nama tab) ----
  // headerRow: nomor baris header SESUAI YANG TERLIHAT di Google Sheet
  // (1-indexed). Default 1 (baris pertama, perilaku lama). Isi mis. 3 kalau
  // di atas tabel ada judul/banner sehingga header sebenarnya ada di baris
  // ketiga.
  async function fetchTab(sheetId, tabName, headerRow) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Gagal mengambil tab "${tabName}" (HTTP ${res.status}). Pastikan nama tab benar & Sheet sudah di-share publik.`);
    }
    const text = await res.text();
    if (/^<!DOCTYPE html/i.test(text.trim())) {
      throw new Error(`Tab "${tabName}" tidak ditemukan, atau Sheet belum di-share "Anyone with the link".`);
    }
    if (headerRow && headerRow > 1) {
      // keepBlankRows: true -> nomor baris hasil parse tetap sama dengan
      // nomor baris asli di Sheet, jadi headerRow (mis. 3) tepat mengacu
      // ke baris ketiga walau ada baris kosong di antara judul & header.
      const rawRows = parseCSV(text, true);
      return rowsToObjectsFrom(rawRows, headerRow - 1);
    }
    return rowsToObjects(parseCSV(text));
  }

  // ---- ambil satu tab MENTAH (raw rows, baris kosong tetap ada) tanpa
  // asumsi posisi header. Dipakai bersama objectsWithAutoHeader() di bawah
  // untuk tab yang posisi baris headernya tidak bisa dipastikan dari luar
  // (mis. tab hasil SUMIFS di workbook "Sumber Data Chart" — lihat catatan
  // di shared-config.js soal chartSourceSheetId & headerRow yang masih
  // tebakan). fetchTab() dengan headerRow tetap dipertahankan apa adanya
  // untuk pemakai lama yang sudah tahu persis posisi headernya. ----
  async function fetchTabRaw(sheetId, tabName) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Gagal mengambil tab "${tabName}" (HTTP ${res.status}). Pastikan nama tab benar & Sheet sudah di-share publik.`);
    }
    const text = await res.text();
    if (/^<!DOCTYPE html/i.test(text.trim())) {
      throw new Error(`Tab "${tabName}" tidak ditemukan, atau spreadsheet belum di-share "Anyone with the link".`);
    }
    return parseCSV(text, true);
  }

  // ---- di beberapa tab, sel header ternyata BUKAN cuma "Kategori"/"Kecamatan"
  // polos — melainkan kalimat judul panjang yang literally diakhiri nama
  // kolom itu DI BARIS YANG SAMA (bukan dipisah Alt+Enter seperti dugaan
  // awal), mis. "Sumber Data — Gambar 5 & 6: ...(Se-Kota Jakarta Timur)
  // Kategori" — satu baris utuh. cleanHeaderCell menangani KEDUA
  // kemungkinan: (1) kalau sel memang berisi line-break, ambil baris
  // terakhir; (2) kalau tidak, tapi sel (setelah spasi dirapikan) DIAKHIRI
  // oleh salah satu nama kolom yang dicari (candidatesLower), pakai nama
  // kolom itu sebagai key bersih; (3) selain itu, sel dibiarkan apa adanya
  // (kolom lain yang memang sudah bersih, mis. "Total Beban", tidak
  // terpengaruh). ----
  function lastLineOfCell(raw) {
    const lines = String(raw === undefined || raw === null ? "" : raw)
      .split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
    return lines.length ? lines[lines.length - 1] : String(raw || "").trim();
  }

  function endsWithCandidate(raw, candidatesLower) {
    const collapsed = String(raw === undefined || raw === null ? "" : raw).replace(/\s+/g, " ").trim().toLowerCase();
    return candidatesLower.some(c => collapsed === c || collapsed.endsWith(" " + c));
  }

  function cleanHeaderCell(raw, candidateHeaderCells) {
    const lastLine = lastLineOfCell(raw);
    const wanted = (candidateHeaderCells || []).map(c => c.trim().toLowerCase());
    if (wanted.length) {
      if (wanted.includes(lastLine.trim().toLowerCase())) return lastLine;
      const collapsed = String(raw === undefined || raw === null ? "" : raw).replace(/\s+/g, " ").trim().toLowerCase();
      const hit = wanted.find(c => collapsed === c || collapsed.endsWith(" " + c));
      if (hit) {
        // pakai nama kolom persis seperti ditulis di candidateHeaderCells (case asli)
        const idx = wanted.indexOf(hit);
        return candidateHeaderCells[idx];
      }
    }
    return lastLine;
  }

  // ---- versi rowsToObjectsFrom yang nama kolomnya dibersihkan lewat
  // cleanHeaderCell() di atas, bukan isi sel apa adanya — supaya sel header
  // gabungan judul+nama-kolom (baik dipisah baris baru ATAU nyambung di
  // baris yang sama) tetap menghasilkan key objek yang bersih (mis.
  // "Kategori", bukan seluruh kalimat judul). candidateHeaderCells dipakai
  // untuk membersihkan SEMUA sel di baris header (bukan cuma yang dicari
  // saat deteksi baris), karena tab yang sama bisa punya lebih dari satu
  // kolom bermasalah serupa. ----
  function objectsFromHeaderRow(rawRows, headerIdx, candidateHeaderCells) {
    const headers = rawRows[headerIdx].map(c => cleanHeaderCell(c, candidateHeaderCells));
    return rawRows.slice(headerIdx + 1)
      .filter(r => r.some(cell => String(cell).trim() !== ""))
      .map(r => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? String(r[i]).trim() : ""; });
        return obj;
      });
  }

  // ---- bangun array-of-objects dari raw rows TANPA asumsi baris header
  // tetap (mis. 1 atau 3) — cari sendiri baris pertama (dari 10 baris
  // pertama) yang mengandung salah satu nama kolom kunci di
  // candidateHeaderCells (cocok tanpa peduli besar/kecil huruf & spasi, dan
  // cocok juga kalau nama kolom itu "menempel" di ujung kalimat judul —
  // baik dipisah baris baru maupun tidak, lihat cleanHeaderCell). Ini
  // dibuat supaya tab seperti "06_Kategori_Petugas_Kota" &
  // "07_Heatmap_Selesai_KecxKategori" tetap terbaca walau baris judul/
  // banner di atasnya beda dari perkiraan, ATAU nama kolom "menempel"
  // dalam sel judul yang sama. ----
  function objectsWithAutoHeader(rawRows, tabName, candidateHeaderCells) {
    const norm = s => String(s === undefined || s === null ? "" : s).trim().toLowerCase();
    const wanted = candidateHeaderCells.map(norm);
    let headerIdx = -1;
    const scanLimit = Math.min(rawRows.length, 10);
    for (let i = 0; i < scanLimit; i++) {
      const cells = rawRows[i];
      const matches = cells.some(c => wanted.includes(norm(c)) || wanted.includes(norm(lastLineOfCell(c))) || endsWithCandidate(c, wanted));
      if (matches) { headerIdx = i; break; }
    }
    if (headerIdx === -1) {
      throw new Error(`Tab "${tabName}": tidak ada baris header yang cocok ditemukan pada 10 baris pertama (dicari salah satu dari: ${candidateHeaderCells.join(", ")}). Cek nama kolom sebenarnya di sheet lalu sesuaikan daftar kandidat header di shared-loader.js.`);
    }
    return objectsFromHeaderRow(rawRows, headerIdx, candidateHeaderCells);
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

  // ---- ambil tab "Sheet1" (data mentah per-SLS) ----
  async function fetchMasterData(sheetId, tabName) {
    return fetchTab(sheetId, tabName);
  }

  function isUnknownKec(kecRaw, kabkoRaw) {
    const kec = String(kecRaw || "").toLowerCase();
    const kabko = String(kabkoRaw || "");
    return kec.indexOf("tidak diketahui") !== -1 || kabko.indexOf("3172000") !== -1;
  }

  /* ---------------------------------------------------------------------
     aggregateMasterData(rows)
     Menghitung semua angka Halaman Utama LANGSUNG dari kolom mentah,
     memakai definisi yang SAMA dengan Laporan Harian SE2026 resmi:

     - progresExclDraft ("tanpa Draft") = jumlah dokumen berstatus
       selain OPEN & DRAFT, dibagi "Assignment" (sudah dialokasikan).
     - progresInclDraft ("termasuk Draft") = jumlah dokumen berstatus
       selain OPEN saja (DRAFT ikut dihitung), dibagi "Assignment".
     - Baris "Tidak Diketahui"/kode 3172000 DIPISAH dari daftar
       kecamatan & peringkat (persis catatan kaki laporan resmi),
       tapi tetap dihitung & ditampilkan sebagai catatan tersendiri.
     - Usaha dalam Keluarga (setara Tabel E) = (Usaha Keluarga Ditemukan
       + Usaha Keluarga Baru) dibagi Prelist Keluarga.
     - Komposisi usaha BKU dipisah dari Keluarga (tidak lagi digabung)
       supaya bendera kualitas data (tutup/ganda/tidak ditemukan) bisa
       dibaca per-jalur, sesuai semangat Tabel D/E laporan resmi.
       Catatan: rincian skala UB vs UMKM (Tabel D) BELUM bisa dihitung
       di sini karena Sheet1 tidak punya kolom skala usaha — perlu tab
       "UsahaBesar" (masih built:false di shared-config.js).
     --------------------------------------------------------------------- */
  function aggregateMasterData(rows) {
    const STATUS_COLS = [
      "OPEN", "DRAFT", "SUBMITTED BY Pencacah", "SUBMITTED RESPONDENT",
      "REJECTED BY Pengawas", "REJECTED BY Admin Kabupaten",
      "REVOKED BY Pengawas", "REVOKED BY Admin Kabupaten",
      "EDITED BY Pengawas", "EDITED BY Admin Kabupaten",
      "APPROVED BY Pengawas", "COMPLETED BY Admin Kabupaten"
    ];

    function blankKecEntry() {
      return {
        assignment: 0, prelist: 0,
        nonOpen: 0, nonOpenNonDraft: 0,
        prelistUsaha: 0, terdataUsaha: 0,
        bkuDitemukan: 0, bkuBaru: 0, bkuTutup: 0, bkuGanda: 0, bkuTidakDitemukan: 0,
        klgUsahaDitemukan: 0, klgUsahaBaru: 0, klgUsahaTutup: 0, klgUsahaGanda: 0, klgUsahaTidakDitemukan: 0,
        klgPrelist: 0, klgHasil: 0
      };
    }

    const statusTotals = {};
    STATUS_COLS.forEach(c => { statusTotals[c] = 0; });

    const petugasSet = new Set();
    let anomaliCount = 0;
    const kecMap = new Map();     // kecamatan definitif -> entry
    let unknown = null;           // baris "Tidak Diketahui" (kode 3172000), dipisah
    const overall = blankKecEntry();

    rows.forEach(r => {
      const assignment = toNum(r["Assignment"]);
      const prelist = toNum(r["Prelist"]);
      const nonOpen = STATUS_COLS.filter(c => c !== "OPEN").reduce((s, c) => s + toNum(r[c]), 0);
      const nonOpenNonDraft = STATUS_COLS.filter(c => c !== "OPEN" && c !== "DRAFT").reduce((s, c) => s + toNum(r[c]), 0);

      const prelistUsaha = toNum(r["Prelist Usaha"]);
      const terdataUsaha = toNum(r["Jumlah Usaha BKU + Keluarga"]);

      const bkuDitemukan = toNum(r["Jumlah Usaha BKU Ditemukan"]);
      const bkuBaru = toNum(r["Jumlah Usaha BKU Baru"]);
      const bkuTutup = toNum(r["Jumlah Usaha BKU Tutup"]);
      const bkuGanda = toNum(r["Jumlah Usaha BKU Ganda"]);
      const bkuTidakDitemukan = toNum(r["Jumlah Usaha BKU Tidak Ditemukan"]);

      const klgUsahaDitemukan = toNum(r["Jumlah Usaha Keluarga Ditemukan"]);
      const klgUsahaBaru = toNum(r["Jumlah Usaha Keluarga Baru"]);
      const klgUsahaTutup = toNum(r["Jumlah Usaha Keluarga Tutup"]);
      const klgUsahaGanda = toNum(r["Jumlah Usaha Keluarga Ganda"]);
      const klgUsahaTidakDitemukan = toNum(r["Jumlah Usaha Keluarga Tidak Ditemukan"]);

      const klgPrelist = toNum(r["Prelist Keluarga"]);
      const klgHasil = toNum(r["Total Hasil Pendataan Keluarga"]);

      const ppl = (r["Nama PPL"] || "").trim();
      if (ppl) petugasSet.add(ppl);

      const rowIsUnknown = isUnknownKec(r["Kecamatan"], r["Kabko"]);

      // anomali dihitung ULANG dari angka mentah (bukan dari kolom
      // persentase siap-pakai di Sheet, yang bisa saja sudah salah/>100%
      // secara sistemik seperti kasus "Tidak Diketahui").
      if (!rowIsUnknown) {
        const flagBku = prelistUsaha > 0 && (bkuDitemukan + bkuBaru) > prelistUsaha * 1.2;
        const flagAssignment = assignment > 0 && nonOpen > assignment;
        if (flagBku || flagAssignment) anomaliCount++;
      }

      STATUS_COLS.forEach(c => { statusTotals[c] += toNum(r[c]); });

      // akumulasi total (semua baris, termasuk Tidak Diketahui — kartu
      // ringkasan resmi juga tetap memasukkan baris ini di angka TOTAL)
      overall.assignment += assignment;
      overall.prelist += prelist;
      overall.nonOpen += nonOpen;
      overall.nonOpenNonDraft += nonOpenNonDraft;
      overall.prelistUsaha += prelistUsaha;
      overall.terdataUsaha += terdataUsaha;
      overall.bkuDitemukan += bkuDitemukan; overall.bkuBaru += bkuBaru;
      overall.bkuTutup += bkuTutup; overall.bkuGanda += bkuGanda; overall.bkuTidakDitemukan += bkuTidakDitemukan;
      overall.klgUsahaDitemukan += klgUsahaDitemukan; overall.klgUsahaBaru += klgUsahaBaru;
      overall.klgUsahaTutup += klgUsahaTutup; overall.klgUsahaGanda += klgUsahaGanda; overall.klgUsahaTidakDitemukan += klgUsahaTidakDitemukan;
      overall.klgPrelist += klgPrelist; overall.klgHasil += klgHasil;

      const kecRaw = (r["Kecamatan"] || "Tanpa Kecamatan").replace(/^\[\d+\]\s*/, "").trim();

      let target;
      if (rowIsUnknown) {
        if (!unknown) unknown = blankKecEntry();
        target = unknown;
      } else {
        if (!kecMap.has(kecRaw)) kecMap.set(kecRaw, blankKecEntry());
        target = kecMap.get(kecRaw);
      }

      target.assignment += assignment;
      target.prelist += prelist;
      target.nonOpen += nonOpen;
      target.nonOpenNonDraft += nonOpenNonDraft;
      target.prelistUsaha += prelistUsaha;
      target.terdataUsaha += terdataUsaha;
      target.bkuDitemukan += bkuDitemukan; target.bkuBaru += bkuBaru;
      target.bkuTutup += bkuTutup; target.bkuGanda += bkuGanda; target.bkuTidakDitemukan += bkuTidakDitemukan;
      target.klgUsahaDitemukan += klgUsahaDitemukan; target.klgUsahaBaru += klgUsahaBaru;
      target.klgUsahaTutup += klgUsahaTutup; target.klgUsahaGanda += klgUsahaGanda; target.klgUsahaTidakDitemukan += klgUsahaTidakDitemukan;
      target.klgPrelist += klgPrelist; target.klgHasil += klgHasil;
    });

    function toKecRow(nama, v) {
      const usahaKeluargaDidata = v.klgUsahaDitemukan + v.klgUsahaBaru;
      return {
        Kelurahan: nama,
        assignment: v.assignment,
        progresExclDraft: pct(v.nonOpenNonDraft, v.assignment),
        progresInclDraft: pct(v.nonOpen, v.assignment),
        Target: v.prelistUsaha,
        Terdata: v.terdataUsaha,
        Persentase: pct(v.terdataUsaha, v.prelistUsaha),
        TargetKeluarga: v.klgPrelist,
        HasilKeluarga: v.klgHasil,
        PersentaseKeluarga: pct(v.klgHasil, v.klgPrelist),
        usahaKeluargaDidata,
        usahaKeluargaPct: pct(usahaKeluargaDidata, v.klgPrelist),
        bku: { ditemukan: v.bkuDitemukan, baru: v.bkuBaru, tutup: v.bkuTutup, ganda: v.bkuGanda, tidakDitemukan: v.bkuTidakDitemukan }
      };
    }

    const kecamatan = Array.from(kecMap.entries())
      .map(([nama, v]) => toKecRow(nama, v))
      .sort((a, b) => b.progresExclDraft - a.progresExclDraft);

    const unknownRow = unknown ? toKecRow("Tidak Diketahui", unknown) : null;

    const overallUsahaKeluargaDidata = overall.klgUsahaDitemukan + overall.klgUsahaBaru;

    return {
      kv: {
        get: () => "—",
        getNum: (key) => ({
          total_usaha_target: overall.prelistUsaha,
          total_usaha_terdata: overall.terdataUsaha,
          pct_progress: pct(overall.nonOpenNonDraft, overall.assignment),
          total_petugas: petugasSet.size,
          total_anomali_terbuka: anomaliCount
        }[key] || 0)
      },
      summary: {
        // ---- progres FASIH: tanpa Draft (utama) & termasuk Draft (pembanding) ----
        prelist: overall.prelist,
        assignment: overall.assignment,
        progresExclDraft: pct(overall.nonOpenNonDraft, overall.assignment),
        progresInclDraft: pct(overall.nonOpen, overall.assignment),
        // ---- jalur usaha (BKU + Keluarga tergabung, dipakai kartu ringkasan) ----
        target: overall.prelistUsaha,
        terdata: overall.terdataUsaha,
        pct: pct(overall.terdataUsaha, overall.prelistUsaha),
        totalPetugas: petugasSet.size,
        totalAnomali: anomaliCount,
        totalSLS: rows.length,
        // ---- rincian komposisi, dipisah BKU vs Keluarga (bukan digabung) ----
        usahaDitemukan: overall.bkuDitemukan + overall.klgUsahaDitemukan,
        usahaBaru: overall.bkuBaru + overall.klgUsahaBaru,
        usahaTutup: overall.bkuTutup + overall.klgUsahaTutup,
        usahaGanda: overall.bkuGanda + overall.klgUsahaGanda,
        usahaTidakDitemukan: overall.bkuTidakDitemukan + overall.klgUsahaTidakDitemukan,
        bku: { ditemukan: overall.bkuDitemukan, baru: overall.bkuBaru, tutup: overall.bkuTutup, ganda: overall.bkuGanda, tidakDitemukan: overall.bkuTidakDitemukan },
        // ---- jalur rumah tangga (seluruh hasil pendataan keluarga) ----
        klgPrelist: overall.klgPrelist,
        klgHasil: overall.klgHasil,
        klgPct: pct(overall.klgHasil, overall.klgPrelist),
        // ---- usaha dalam keluarga, setara Tabel E ----
        usahaKeluargaDidata: overallUsahaKeluargaDidata,
        usahaKeluargaPct: pct(overallUsahaKeluargaDidata, overall.klgPrelist)
      },
      kecamatan,
      unknown: unknownRow,
      statusTotals,
      statusOrder: STATUS_COLS
    };
  }

  /* ---------------------------------------------------------------------
     PARSER TAB "06_Kategori_Petugas_Kota" & "07_Heatmap_Selesai_KecxKategori"
     (workbook TERPISAH "Sumber_Data_Chart_Monitoring_SE2026_Jaktim" —
     lihat catatan chartSourceSheetId di shared-config.js).

     Kedua tab ini SUDAH berupa tabel ringkasan siap-pakai (dihitung lewat
     SUMIFS/COUNTIFS dari tab Bantu_Hitung_BA_BK di workbook yang sama),
     JADI tidak perlu agregasi ulang seperti aggregateMasterData() di atas
     — cukup dibaca lalu dipetakan ke nama field yang dipakai halaman.

     Karena kita belum bisa memverifikasi teks header persis di kedua tab
     ini (butuh akses langsung ke Sheet), pemetaan kolom di bawah memakai
     beberapa KANDIDAT nama header sekaligus (case-insensitive, spasi
     dirapikan) — jadi tetap terbaca walau header sedikit beda kapitalisasi
     atau spasi dari yang diperkirakan. Kalau kolom kunci sama sekali tidak
     ketemu, fungsi melempar error yang jelas (nama tab + header yang
     benar-benar terbaca) supaya gampang dicocokkan ke Sheet aslinya.
     --------------------------------------------------------------------- */

  // cari field di objek baris berdasarkan beberapa kandidat nama header,
  // dicocokkan tanpa peduli besar/kecil huruf & spasi berlebih.
  function pickField(row, candidates) {
    const keys = Object.keys(row);
    for (const cand of candidates) {
      const norm = cand.trim().toLowerCase();
      const found = keys.find(k => k.trim().toLowerCase() === norm);
      if (found !== undefined) return row[found];
    }
    return undefined;
  }

  function headerList(rows) {
    return rows.length ? Object.keys(rows[0]) : [];
  }

  // Sel heatmap ber-isi "-" (kategori tidak beroperasi di kecamatan itu,
  // lihat definisi Gambar 7 pada laporan resmi) -> ditandai null, BUKAN 0,
  // supaya tidak ikut dianggap "capaian 0%" saat dicari nilai
  // tertinggi/terendah atau diwarnai di heatmap.
  function toNumOrNull(v) {
    const s = String(v === undefined || v === null ? "" : v).trim();
    if (s === "" || s === "-" || s === "—" || /^n\/?a$/i.test(s)) return null;
    return toNum(s);
  }

  /* ---- Tab "06_Kategori_Petugas_Kota" (sumber Gambar 5 & 6) ----
     Diharapkan 1 baris per kategori (STIS/UMUM/SAINTEK/AFIRMASI) dengan
     kolom: Kategori, Total Beban, Petugas, % Selesai, % Approved — persis
     tabel Bagian 7.1 pada laporan resmi. */
  function parseKategoriPetugasKota(rows) {
    if (!rows.length) throw new Error(`Tab "06_Kategori_Petugas_Kota" terbaca tapi kosong (0 baris data).`);
    const out = rows.map(r => {
      const kategori = pickField(r, ["Kategori", "Kategori Petugas", "Jenis Petugas"]);
      const totalBeban = pickField(r, ["Total Beban", "Beban Tugas", "Assignment", "Total Assignment"]);
      const petugas = pickField(r, ["Petugas", "Jumlah Petugas", "Jml Petugas", "Jumlah Pencacah"]);
      const pctSelesai = pickField(r, ["% Selesai", "%Selesai", "% Selesai (Sub+App+Rej)", "%Selesai (Sub+App+Rej)", "Persentase Selesai", "Pct Selesai"]);
      const pctApproved = pickField(r, ["% Approved", "%Approved", "Persentase Approved", "Pct Approved"]);
      if (kategori === undefined) {
        throw new Error(`Tab "06_Kategori_Petugas_Kota": kolom "Kategori" tidak ditemukan. Header yang terbaca: ${headerList(rows).join(", ")}`);
      }
      return {
        kategori: String(kategori).trim().toUpperCase(),
        totalBeban: toNum(totalBeban),
        petugas: toNum(petugas),
        pctSelesai: toNum(pctSelesai),
        pctApproved: toNum(pctApproved)
      };
    }).filter(r => r.kategori);
    return out.sort((a, b) => b.totalBeban - a.totalBeban);
  }

  /* ---- Tab "07_Heatmap_Selesai_KecxKategori" (sumber Gambar 7) ----
     Diharapkan 1 baris per kecamatan dengan kolom: Kecamatan, STIS, UMUM,
     SAINTEK, AFIRMASI — nilai % Selesai per kombinasi, sel "-" berarti
     kategori itu tidak beroperasi di kecamatan tsb (jadi null, bukan 0). */
  function parseHeatmapKecKategori(rows) {
    if (!rows.length) throw new Error(`Tab "07_Heatmap_Selesai_KecxKategori" terbaca tapi kosong (0 baris data).`);
    const CATS = ["STIS", "UMUM", "SAINTEK", "AFIRMASI"];
    const out = rows.map(r => {
      const kecamatan = pickField(r, ["Kecamatan", "Nama Kecamatan", "Kode Kecamatan"]);
      if (kecamatan === undefined) {
        throw new Error(`Tab "07_Heatmap_Selesai_KecxKategori": kolom "Kecamatan" tidak ditemukan. Header yang terbaca: ${headerList(rows).join(", ")}`);
      }
      const cells = {};
      CATS.forEach(c => { cells[c] = toNumOrNull(pickField(r, [c, c.charAt(0) + c.slice(1).toLowerCase()])); });
      return { kecamatan: String(kecamatan).replace(/^\[\d+\]\s*/, "").trim(), cells };
    }).filter(r => r.kecamatan);
    return { categories: CATS, rows: out };
  }

  // Ekspor fungsi-fungsi ini supaya dipakai oleh setiap halaman menu
  window.SheetEngine = {
    fetchTab, fetchTabRaw, objectsWithAutoHeader, objectsFromHeaderRow, lastLineOfCell, fetchMasterData, aggregateMasterData,
    parseKategoriPetugasKota, parseHeatmapKecKategori,
    rowsToObjects, rowsToObjectsFrom, rowsToKV, parseCSV, toNum, fmtID, yesNo, pct
  };

})();
