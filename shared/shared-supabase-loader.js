/* =====================================================================
   SHARED-SUPABASE-LOADER.JS
   Pengganti sisi-baca gviz/Google Sheets, dipakai saat
   window.APP_CONFIG.dataSource === "supabase" (lihat shared-config.js).

   Prinsip migrasi (Fase 2 rancangan): logika aggregateMasterData() di
   shared-loader.js TIDAK DIUBAH SAMA SEKALI — supaya angka Halaman Utama
   dijamin identik dengan versi Google Sheets selama masa uji paralel.
   Yang berubah HANYA dari mana rows-nya diambil: dulu CSV gviz tab
   "Sheet1", sekarang REST (PostgREST) ke view "v_sls_data_public" di
   Supabase (bukan tabel sls_data langsung — kolom Email/Nama PPL & PML
   sengaja tidak ada di situ, lihat supabase_schema.sql §4).

   Report Kategori Petugas TIDAK LAGI butuh workbook kedua ("Sumber Data
   Chart") sama sekali — kolom "Status" di sls_data sudah berisi kategori
   petugas (umum/stis/saintek/afirmasi), jadi cukup query dua view siap-
   pakai: v_kategori_petugas_kota & v_heatmap_kec_x_kategori.

   Butuh <script> supabase-js (CDN) dimuat SEBELUM file ini di setiap
   halaman yang memakainya. Lihat catatan di shared-config.js.
   ===================================================================== */
(function () {

  // ---- Pembantu generik: ambil SEMUA baris dari sebuah view lewat
  // .range() bertahap, sama seperti fetchMasterDataSupabase() di bawah.
  // WAJIB dipakai untuk SETIAP view Supabase yang dibaca "select('*')"
  // tanpa filter — PostgREST diam-diam memotong hasil di default Max Rows
  // (1000) TANPA mengembalikan error, jadi kalau baris view lebih banyak
  // dari itu, halaman akan menampilkan data yang terpotong tanpa pemberi-
  // tahuan apapun. makeQuery(from, to) harus mengembalikan query builder
  // BARU tiap dipanggil (builder Supabase tidak bisa dipakai ulang setelah
  // di-.range() & dieksekusi).
  async function fetchAllRows(makeQuery, pageSize) {
    pageSize = pageSize || 1000;
    let from = 0;
    let rows = [];
    while (true) {
      const { data, error } = await makeQuery(from, from + pageSize - 1);
      if (error) throw error;
      if (!data || !data.length) break;
      rows = rows.concat(data);
      if (data.length < pageSize) break; // halaman terakhir (kurang dari pageSize -> tidak ada lagi)
      from += pageSize;
    }
    return rows;
  }

  let _client = null;
  function getClient() {
    if (_client) return _client;
    const cfg = window.APP_CONFIG;
    if (!cfg || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      throw new Error("supabaseUrl / supabaseAnonKey belum diisi di shared-config.js.");
    }
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Library supabase-js belum dimuat (cek tag <script> CDN di halaman ini, sebelum shared-supabase-loader.js).");
    }
    _client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    return _client;
  }

  // ---- Halaman Utama: rows mentah (versi publik, tanpa kolom sensitif)
  // dari v_sls_data_public, lalu diagregasi dengan aggregateMasterData()
  // yang SAMA PERSIS dengan versi Google Sheets (dari shared-loader.js). ----
  async function fetchMasterDataSupabase() {
    const client = getClient();

    // Supabase/PostgREST membatasi jumlah baris per request (default 1000).
    // sls_data ~9.700 baris -> ambil bertahap (range) sampai habis.
    let rows;
    try {
      rows = await fetchAllRows((from, to) => client.from("v_sls_data_public").select("*").range(from, to));
    } catch (err) {
      throw new Error(`Gagal membaca v_sls_data_public dari Supabase: ${err.message}`);
    }

    const { data: petugasRow, error: petugasErr } = await client
      .from("v_total_petugas")
      .select("total_petugas")
      .single();
    if (petugasErr) throw new Error(`Gagal membaca v_total_petugas dari Supabase: ${petugasErr.message}`);

    if (!window.SheetEngine || !window.SheetEngine.aggregateMasterData) {
      throw new Error("shared-loader.js (SheetEngine.aggregateMasterData) belum dimuat — file ini dipakai ULANG, bukan diduplikasi.");
    }
    const result = window.SheetEngine.aggregateMasterData(rows);
    // Nama PPL sengaja tidak ada di v_sls_data_public -> hitung dari view
    // terpisah yang hanya memberi ANGKA (bukan nama), lihat supabase_schema.sql.
    result.summary.totalPetugas = (petugasRow && petugasRow.total_petugas) || 0;
    return result;
  }

  // ---- Report Kategori Petugas: langsung dari view, tidak perlu lagi
  // auto-detect header / workbook kedua sama sekali. ----
  async function fetchKategoriPetugasSupabase() {
    const client = getClient();
    let rows;
    try {
      rows = await fetchAllRows((from, to) =>
        client.from("v_kategori_petugas_kota").select("*").order("total_beban", { ascending: false }).range(from, to)
      );
    } catch (err) {
      throw new Error(`Gagal membaca v_kategori_petugas_kota dari Supabase: ${err.message}`);
    }
    return rows.map(r => ({
      kategori: String(r.kategori || "").trim().toUpperCase(),
      totalBeban: Number(r.total_beban) || 0,
      petugas: Number(r.petugas) || 0,
      pctSelesai: Number(r.pct_selesai) || 0,
      pctApproved: Number(r.pct_approved) || 0
    }));
  }

  async function fetchHeatmapSupabase() {
    const client = getClient();
    let data;
    try {
      data = await fetchAllRows((from, to) => client.from("v_heatmap_kec_x_kategori").select("*").range(from, to));
    } catch (err) {
      throw new Error(`Gagal membaca v_heatmap_kec_x_kategori dari Supabase: ${err.message}`);
    }

    // View datang dalam format LONG (1 baris per kec x kategori) -> pivot
    // jadi bentuk matrix yang sama persis seperti keluaran
    // parseHeatmapKecKategori() versi gviz lama, supaya kode render di
    // report-kategori-petugas.html tidak perlu diubah.
    const CATS = ["STIS", "UMUM", "SAINTEK", "AFIRMASI"];
    const byKec = new Map();
    (data || []).forEach(r => {
      const kec = String(r.kecamatan || "").trim();
      if (!kec) return;
      if (!byKec.has(kec)) {
        const cells = {};
        CATS.forEach(c => { cells[c] = null; });
        byKec.set(kec, cells);
      }
      const kategori = String(r.kategori || "").trim().toUpperCase();
      if (CATS.indexOf(kategori) !== -1) {
        byKec.get(kec)[kategori] = r.pct_selesai === null || r.pct_selesai === undefined ? null : Number(r.pct_selesai);
      }
    });
    const rowsOut = Array.from(byKec.entries()).map(([kecamatan, cells]) => ({ kecamatan, cells }));
    return { categories: CATS, rows: rowsOut };
  }

  // ---- Report Petugas: progres per PPL & per PML, dikelompokkan per
  // kecamatan — dari view v_progres_ppl & v_progres_pml (lihat
  // supabase_view_progres_petugas.sql). Berbeda dari view lain, DUA view
  // ini SENGAJA menyertakan Nama PPL/PML (tujuan report ini memang untuk
  // dasar pembayaran per petugas). Baris dengan SLS belum ditugaskan
  // (Nama PPL/PML kosong) sudah dikecualikan langsung di view-nya. ----
  function mapProgresRow(r, role) {
    const out = {
      kecamatan: String(r.kecamatan || "").trim(),
      nama: String((role === "ppl" ? r.nama_ppl : r.nama_pml) || "").trim(),
      // Email dipakai report-petugas.html untuk mendeteksi & menggabungkan
      // 1 orang yang muncul sebagai >1 baris karena wilayah tugasnya beda
      // kecamatan (lihat mergeDuplicatePetugas() di halaman itu). Kolom
      // ini SUDAH ada di view (dipakai juga oleh mapProgresHarianRow &
      // mapPplPmlFields di file ini) — di sini sebelumnya belum dipetakan.
      email: String((role === "ppl" ? r.email_ppl : r.email_pml) || "").trim(),
      jumlahSls: Number(r.jumlah_sls) || 0,
      prelist: Number(r.prelist) || 0,
      hasilPendataan: Number(r.hasil_pendataan_keseluruhan) || 0,
      progresPendataanPct: r.progres_pendataan_pct === null || r.progres_pendataan_pct === undefined ? 0 : Number(r.progres_pendataan_pct),

      prelistUsaha: Number(r.prelist_usaha) || 0,
      hasilUsahaBku: Number(r.hasil_usaha_bku) || 0,
      progresUsahaBkuPct: r.progres_usaha_bku_pct === null || r.progres_usaha_bku_pct === undefined ? 0 : Number(r.progres_usaha_bku_pct),
      hasilUsahaRumahTangga: Number(r.hasil_usaha_rumah_tangga) || 0,

      prelistKeluarga: Number(r.prelist_keluarga) || 0,
      hasilPendataanKeluarga: Number(r.hasil_pendataan_keluarga) || 0,
      progresKeluargaPct: r.progres_keluarga_pct === null || r.progres_keluarga_pct === undefined ? 0 : Number(r.progres_keluarga_pct)
    };
    if (role === "pml") out.jumlahPetugas = Number(r.jumlah_petugas) || 0;
    return out;
  }

  async function fetchProgresPetugasSupabase() {
    const client = getClient();
    let pplData, pmlData;
    try {
      [pplData, pmlData] = await Promise.all([
        fetchAllRows((from, to) => client.from("v_progres_ppl").select("*").order("kecamatan").order("nama_ppl").range(from, to)),
        fetchAllRows((from, to) => client.from("v_progres_pml").select("*").order("kecamatan").order("nama_pml").range(from, to))
      ]);
    } catch (err) {
      throw new Error(`Gagal membaca v_progres_ppl / v_progres_pml dari Supabase: ${err.message}`);
    }
    return {
      ppl: pplData.map(r => mapProgresRow(r, "ppl")),
      pml: pmlData.map(r => mapProgresRow(r, "pml"))
    };
  }

  // ---- Progres Harian Petugas: SAMA seperti mapProgresRow() di atas
  // (Report Petugas), plus dimensi tanggal & delta harian — dari view
  // v_progres_ppl_harian & v_progres_pml_harian (lihat
  // resume_progres_harian_ppl_pml.md §3). Kolom inti (jumlah_sls,
  // prelist, hasil_pendataan_keseluruhan, progres_pendataan_pct)
  // SENGAJA dipetakan dengan nama field yang sama seperti mapProgresRow
  // supaya kartu/format angka bisa dipakai ulang di halaman — hanya
  // ditambah tanggal, deltaProgresPct, & statusProgres. ----
  function mapProgresHarianRow(r, role) {
    const out = {
      tanggal: String(r.tanggal || "").trim(),
      kecamatan: String(r.kecamatan || "").trim(),
      nama: String((role === "ppl" ? r.nama_ppl : r.nama_pml) || "").trim(),
      email: String((role === "ppl" ? r.email_ppl : r.email_pml) || "").trim(),
      jumlahSls: Number(r.jumlah_sls) || 0,
      prelist: Number(r.prelist) || 0,
      hasilPendataan: Number(r.hasil_pendataan_keseluruhan) || 0,
      progresPendataanPct: r.progres_pendataan_pct === null || r.progres_pendataan_pct === undefined ? 0 : Number(r.progres_pendataan_pct),
      deltaProgresPct: r.delta_progres_pct === null || r.delta_progres_pct === undefined ? null : Number(r.delta_progres_pct),
      statusProgres: String(r.status_progres || "").trim()
    };
    if (role === "pml") out.jumlahPetugas = Number(r.jumlah_petugas) || 0;
    return out;
  }

  async function fetchProgresHarianSupabase() {
    const client = getClient();
    const cfg = window.APP_CONFIG || {};
    const tbl = (cfg.supabaseTables && cfg.supabaseTables.progresHarian) || {};
    const viewPpl = tbl.ppl || "v_progres_ppl_harian";
    const viewPml = tbl.pml || "v_progres_pml_harian";
    let pplData, pmlData;
    try {
      [pplData, pmlData] = await Promise.all([
        fetchAllRows((from, to) => client.from(viewPpl).select("*").order("tanggal").order("kecamatan").order("nama_ppl").range(from, to)),
        fetchAllRows((from, to) => client.from(viewPml).select("*").order("tanggal").order("kecamatan").order("nama_pml").range(from, to))
      ]);
    } catch (err) {
      throw new Error(`Gagal membaca ${viewPpl} / ${viewPml} dari Supabase: ${err.message}`);
    }
    return {
      ppl: pplData.map(r => mapProgresHarianRow(r, "ppl")),
      pml: pmlData.map(r => mapProgresHarianRow(r, "pml"))
    };
  }

  // ---- Report Kecamatan: progres per Kelurahan/Desa, dikelompokkan di
  // bawah Kecamatan induknya — dari view v_progres_kelurahan (lihat
  // tambahan_view_progres_kelurahan.sql). Formula PERSIS SAMA dengan
  // v_progres_kecamatan, hanya level pengelompokannya lebih rinci.
  // Baris is_unknown=true (kode Kabko 3172000 / kecamatan belum
  // terklasifikasi) TETAP diikutkan di sini apa adanya — disaring di sisi
  // halaman (report-kecamatan.html), sama pola dengan baris "Tidak
  // Diketahui" di Halaman Utama. ----
  function mapProgresKelurahanRow(r) {
    return {
      kecamatan: String(r.kecamatan || "").trim(),
      kelurahan: String(r.kelurahan || "").trim(),
      isUnknown: !!r.is_unknown,
      jumlahSls: Number(r.jumlah_sls) || 0,
      assignment: Number(r.assignment) || 0,
      prelist: Number(r.prelist) || 0,
      progresExclDraftPct: r.progres_excl_draft === null || r.progres_excl_draft === undefined ? 0 : Number(r.progres_excl_draft),
      progresInclDraftPct: r.progres_incl_draft === null || r.progres_incl_draft === undefined ? 0 : Number(r.progres_incl_draft),

      targetUsaha: Number(r.target_usaha) || 0,
      terdataUsaha: Number(r.terdata_usaha) || 0,
      progresUsahaPct: r.pct_usaha === null || r.pct_usaha === undefined ? 0 : Number(r.pct_usaha),

      targetKeluarga: Number(r.target_keluarga) || 0,
      hasilKeluarga: Number(r.hasil_keluarga) || 0,
      progresKeluargaPct: r.pct_keluarga === null || r.pct_keluarga === undefined ? 0 : Number(r.pct_keluarga),

      usahaTidakDitemukan: Number(r.usaha_tidak_ditemukan) || 0,
      rumahTanggaTidakDitemukan: Number(r.rumah_tangga_tidak_ditemukan) || 0
    };
  }

  async function fetchProgresKelurahanSupabase() {
    const client = getClient();
    let rows;
    try {
      rows = await fetchAllRows((from, to) =>
        client.from("v_progres_kelurahan").select("*").order("kecamatan").order("kelurahan").range(from, to)
      );
    } catch (err) {
      throw new Error(`Gagal membaca v_progres_kelurahan dari Supabase: ${err.message}`);
    }
    return rows.map(mapProgresKelurahanRow);
  }

  // ---- Update Data (pengganti menu Upload Data lama): halaman ini TIDAK
  // menulis apapun ke Supabase — hanya menampilkan status/riwayat, jadi
  // dua fungsi di bawah SEMUANYA cuma baca (SELECT/COUNT). Update data
  // mentah yang sebenarnya dilakukan langsung di sisi Supabase (Table
  // Editor/SQL Editor/script impor terpisah), lihat catatan di
  // shared-config.js & sql/data_sync_log.sql. ----

  // Hitung jumlah baris tiap view penting lewat COUNT (head:true) —
  // TIDAK menarik isinya, jadi ringan walau baris di sls_data ~9.700+.
  async function fetchDataOverviewSupabase() {
    const client = getClient();
    const cfg = window.APP_CONFIG || {};
    const views = (cfg.supabaseTables && cfg.supabaseTables.countViews) || {};

    async function countOf(viewName) {
      if (!viewName) return null;
      const { count, error } = await client.from(viewName).select("*", { count: "exact", head: true });
      if (error) throw new Error(`Gagal menghitung baris "${viewName}": ${error.message}`);
      return count === null || count === undefined ? 0 : count;
    }

    const [slsData, progresPpl, progresPml, progresKelurahan, kategoriPetugas] = await Promise.all([
      countOf(views.slsData),
      countOf(views.progresPpl),
      countOf(views.progresPml),
      countOf(views.progresKelurahan),
      countOf(views.kategoriPetugas)
    ]);
    return { slsData, progresPpl, progresPml, progresKelurahan, kategoriPetugas };
  }

  // Riwayat update manual/ETL, dari tabel data_sync_log (lihat
  // sql/data_sync_log.sql). Kalau tabelnya belum dibuat, PostgREST akan
  // mengembalikan error (kode "42P01") — dibiarkan lempar ke pemanggil
  // supaya update-data.html bisa menampilkan pesan & SQL pembuatannya,
  // bukan diam-diam dianggap "belum ada riwayat".
  async function fetchSyncLogSupabase(limit) {
    const client = getClient();
    const cfg = window.APP_CONFIG || {};
    const tableName = (cfg.supabaseTables && cfg.supabaseTables.dataSyncLog) || "data_sync_log";
    const { data, error } = await client
      .from(tableName)
      .select("*")
      .order("synced_at", { ascending: false })
      .limit(limit || 25);
    if (error) throw error;
    return data || [];
  }

  // ---------------------------------------------------------------------
  // Report Anomali Pendataan: baca LIMA VIEW anomali (revisi 2 Agu 2026
  // sore — lihat catatan di shared-config.js). Kolom Nama/Email PPL & PML
  // dan Kecamatan/Kelurahan SUDAH di-join langsung di view (bukan di sini
  // lagi). Perhitungan status anomali kategori 1 (gap hasil vs Wilkerstat)
  // TETAP dilakukan di klien (report-anomali.html, konstanta GAP_PCT_*);
  // kategori 2-5 SUDAH difilter server-side (view berakhiran "_nol"), jadi
  // di sini murni pemetaan nama kolom mentah -> camelCase saja.
  // ---------------------------------------------------------------------
  function mapPplPmlFields(r) {
    return {
      idSubsls: String(r.id_subsls || "").trim(),
      kecamatan: String(r.kecamatan || "").trim(),
      kelurahan: String(r.kelurahan || "").trim(),
      namaSls: String(r.nama_sls || "").trim(),
      namaPpl: String(r.nama_ppl || "").trim(),
      emailPpl: String(r.email_ppl || "").trim(),
      namaPml: String(r.nama_pml || "").trim(),
      emailPml: String(r.email_pml || "").trim()
    };
  }

  // v_anomali_1_hasil_vs_wilkerstat — SEMUA SubSLS, tidak difilter di view.
  function mapHasilVsWilkerstatRow(r) {
    return Object.assign(mapPplPmlFields(r), {
      jumlahKkWilkerstat: Number(r.jumlah_kk_wilkerstat) || 0,
      jumlahUsahaWilkerstat: Number(r.jumlah_usaha_wilkerstat) || 0,
      jumlahMuatanWilkerstat: Number(r.jumlah_muatan_wilkerstat) || 0,
      jumlahBsttWilkerstat: Number(r.jumlah_bstt_wilkerstat) || 0,
      hasilPendataanKeluarga: Number(r.hasil_pendataan_keluarga) || 0,
      hasilUsahaBku: Number(r.hasil_usaha_bku) || 0,
      hasilUsahaTotal: Number(r.hasil_usaha_total) || 0,
      selisihKeluarga: Number(r.selisih_keluarga) || 0,
      selisihUsaha: Number(r.selisih_usaha) || 0
    });
  }

  // v_anomali_2_sls_progres_nol — SUDAH difilter progres=0 di view; punya kolom prelist.
  function mapSlsProgresNolRow(r) {
    return Object.assign(mapPplPmlFields(r), {
      prelist: Number(r.prelist) || 0,
      assignment: Number(r.assignment) || 0,
      open: Number(r.open) || 0
    });
  }

  // v_anomali_3_muatan_ekonomi_nol — SUDAH difilter di view; tidak punya prelist/assignment,
  // melainkan angka acuan Wilkerstat + jenis muatan dominan.
  function mapMuatanEkonomiNolRow(r) {
    return Object.assign(mapPplPmlFields(r), {
      jumlahUsahaWilkerstat: Number(r.jumlah_usaha_wilkerstat) || 0,
      jumlahMuatanWilkerstat: Number(r.jumlah_muatan_wilkerstat) || 0,
      jenisMuatanDominan: String(r.jenis_muatan_dominan || "").trim()
    });
  }

  // v_anomali_4_elit_progres_nol & v_anomali_5_biasa_progres_nol — SUDAH difilter di
  // view; struktur sama (jenis_muatan_dominan + assignment + open, TANPA prelist).
  function mapProgresNolTipeRow(r) {
    return Object.assign(mapPplPmlFields(r), {
      jenisMuatanDominan: String(r.jenis_muatan_dominan || "").trim(),
      assignment: Number(r.assignment) || 0,
      open: Number(r.open) || 0
    });
  }

  async function fetchAnomaliPendataanSupabase() {
    const client = getClient();
    const cfg = window.APP_CONFIG || {};
    const tbl = (cfg.supabaseTables && cfg.supabaseTables.anomali) || {};
    if (!tbl.hasilVsWilkerstat) {
      throw new Error("Nama view anomali belum diisi di shared-config.js (supabaseTables.anomali).");
    }
    const byKecKelSls = (from, to, viewName) =>
      client.from(viewName).select("*").order("kecamatan").order("kelurahan").order("nama_sls").range(from, to);

    let hasilVsWilkerstat, slsProgresNol, muatanEkonomiNol, elitProgresNol, biasaProgresNol;
    try {
      [hasilVsWilkerstat, slsProgresNol, muatanEkonomiNol, elitProgresNol, biasaProgresNol] = await Promise.all([
        fetchAllRows((from, to) => byKecKelSls(from, to, tbl.hasilVsWilkerstat)),
        fetchAllRows((from, to) => byKecKelSls(from, to, tbl.slsProgresNol)),
        fetchAllRows((from, to) => byKecKelSls(from, to, tbl.muatanEkonomiNol)),
        fetchAllRows((from, to) => byKecKelSls(from, to, tbl.elitProgresNol)),
        fetchAllRows((from, to) => byKecKelSls(from, to, tbl.biasaProgresNol))
      ]);
    } catch (err) {
      throw new Error(`Gagal membaca view anomali_1..5 dari Supabase: ${err.message}`);
    }
    return {
      hasilVsWilkerstat: hasilVsWilkerstat.map(mapHasilVsWilkerstatRow),
      slsProgresNol: slsProgresNol.map(mapSlsProgresNolRow),
      muatanEkonomiNol: muatanEkonomiNol.map(mapMuatanEkonomiNolRow),
      elitProgresNol: elitProgresNol.map(mapProgresNolTipeRow),
      biasaProgresNol: biasaProgresNol.map(mapProgresNolTipeRow)
    };
  }

  // ---------------------------------------------------------------------
  // Report Usaha Besar (UB): lihat catatan Fase "2 Agu 2026, malam" di
  // shared-config.js. TIGA fungsi di bawah masing-masing untuk satu
  // bagian report-usaha-besar.html — Bagian 1 (progres pegawai harian,
  // SEHARUSNYA mencakup SEMUA asal alokasi — lihat PERBAIKAN 3 Agu 2026 di
  // bawah, dulu view-nya difilter status='BPS Jakarta Timur' sehingga
  // petugas kategori JIEP hilang total dari Bagian 1), Bagian 2 (rekap
  // kecamatan x status, semua status, + progres selesai/belum), Bagian 3
  // (detail hasil pendataan per petugas, digabung dengan hitungan "Belum
  // Diproses" dari tabel dasar — SATU-SATUNYA tempat tabel dasar
  // ub_se2026_bps3172 dibaca langsung, dan hanya dua kolom: petugas, pml).
  // ---------------------------------------------------------------------
  function ubTables() {
    const cfg = window.APP_CONFIG || {};
    return (cfg.supabaseTables && cfg.supabaseTables.usahaBesar) || {};
  }

  // PERBAIKAN 3 Agu 2026 — kategori pegawai (JIEP / Non JIEP) TIDAK
  // disimpan sebagai kolom terpisah di sumber data manapun; yang ada
  // hanya kolom "status" (asal alokasi UB). Berdasarkan pengecekan
  // langsung ke data (query "sumber_petugas" yang dipakai untuk
  // diagnosis), pemetaannya konsisten:
  //   status = JIEP / Rutinan            -> petugas kategori "JIEP"
  //   status = BPS Jakarta Timur / RI    -> petugas kategori "Non JIEP"
  //   status = STIS / Data Kantor Pusat  -> tidak ada petugas internal
  //                                          (dikerjakan pihak luar)
  // Kalau nanti ada status baru yang juga dikerjakan petugas internal,
  // TAMBAHKAN di sini (bukan di report-usaha-besar.html).
  //
  // CATATAN 5 Agu 2026: status="RI" tetap dipetakan ke "Non JIEP" di
  // sini (dipakai kalau ada pemanggil lain), TAPI report-usaha-besar.html
  // (Bagian 1 — progres PML/petugas) sekarang MEMBUANG baris status="RI"
  // & status="PROVINSI" sebelum sampai ke fungsi ini (lihat
  // EXCLUDED_STATUS_BAGIAN1 / mergePegawaiRows() di file tsb) — jadi
  // untuk Bagian 1, hasil pemetaan "RI" -> "Non JIEP" di bawah ini
  // sebenarnya tidak pernah dipakai lagi. "PROVINSI" masih belum
  // dikenali fungsi ini (return "") — sengaja tidak diberi kategori
  // karena memang harus dikecualikan, bukan didiamkan tercampur.
  function kategoriPetugasFromStatus(status) {
    const s = String(status || "").trim();
    if (s === "JIEP" || s === "Rutinan") return "JIEP";
    if (s === "BPS Jakarta Timur" || s === "RI") return "Non JIEP";
    return "";
  }
  window.kategoriPetugasFromStatus = kategoriPetugasFromStatus;

  function mapProgresPegawaiHarianRow(r) {
    // "status" HARUS ditambahkan ke SELECT view v_progres_pegawai_harian
    // (lihat sql/fix-report-usaha-besar-3agu2026.sql) supaya kategori
    // JIEP/Non JIEP bisa dihitung di sini. Kalau view lama belum
    // diperbarui, kolom ini akan kosong ("") dan halaman otomatis
    // menampilkan tab kategori sebagai "Tidak diketahui" — bukan error,
    // tapi tandanya migrasi SQL belum dijalankan.
    const status = String(r.status || "").trim();
    return {
      tanggalSnapshot: String(r.tanggal_snapshot || "").trim(),
      petugas: String(r.petugas || "").trim(),
      pml: String(r.pml || "").trim(),
      status: status,
      kategoriPetugas: kategoriPetugasFromStatus(status),
      totalAlokasi: Number(r.total_alokasi) || 0,
      submit: Number(r.submit) || 0,
      sudahDiproses: Number(r.sudah_diproses) || 0,
      belumDiproses: Number(r.belum_diproses) || 0,
      persenSubmit: r.persen_submit === null || r.persen_submit === undefined ? 0 : Number(r.persen_submit)
    };
  }

  async function fetchProgresPegawaiHarianUBSupabase() {
    const client = getClient();
    const tbl = ubTables();
    const viewName = tbl.progresPegawaiHarian || "v_progres_pegawai_harian";
    let rows;
    try {
      rows = await fetchAllRows((from, to) =>
        client.from(viewName).select("*").order("tanggal_snapshot").order("pml").order("petugas").range(from, to)
      );
    } catch (err) {
      throw new Error(`Gagal membaca ${viewName} dari Supabase: ${err.message}`);
    }
    return rows.map(mapProgresPegawaiHarianRow);
  }

  // jumlahSelesai/jumlahBelum: kolom BARU yang perlu ditambahkan ke view
  // v_progres_kategori_kecamatan (lihat sql/fix-report-usaha-besar-3agu2026.sql)
  // supaya Bagian 2 bisa menampilkan % PROGRES per kecamatan, bukan cuma
  // total target. "Selesai" pakai definisi sama seperti Bagian 1: SEMUA
  // kode ket_hasil 1-9 dianggap sudah diproses, bukan submit saja. Kalau
  // view lama belum diperbarui, dua field ini akan bernilai null (BUKAN
  // 0) — dibedakan dari 0 supaya UI tahu harus menyembunyikan tab
  // "Progres (%)" alih-alih menampilkan 0% yang menyesatkan.
  function mapKategoriKecamatanUBRow(r) {
    const hasProgres = r.jumlah_selesai !== undefined && r.jumlah_selesai !== null;
    return {
      kecamatan: String(r.kecamatan || "").trim(),
      status: String(r.status || "").trim(),
      jumlah: Number(r.jumlah) || 0,
      jumlahSelesai: hasProgres ? (Number(r.jumlah_selesai) || 0) : null,
      jumlahBelum: hasProgres ? (Number(r.jumlah_belum) || 0) : null
    };
  }

  async function fetchKategoriKecamatanUBSupabase() {
    const client = getClient();
    const tbl = ubTables();
    const viewName = tbl.progresKategoriKecamatan || "v_progres_kategori_kecamatan";
    let rows;
    try {
      rows = await fetchAllRows((from, to) => client.from(viewName).select("*").order("kecamatan").range(from, to));
    } catch (err) {
      throw new Error(`Gagal membaca ${viewName} dari Supabase: ${err.message}`);
    }
    return rows.map(mapKategoriKecamatanUBRow);
  }

  function mapDetailHasilUBRow(r) {
    return {
      petugas: String(r.petugas || "").trim(),
      pml: String(r.pml || "").trim(),
      ketHasil: r.ket_hasil === null || r.ket_hasil === undefined ? null : Number(r.ket_hasil),
      deskripsi: String(r.deskripsi || "").trim(),
      jumlah: Number(r.jumlah) || 0
    };
  }

  // Menggabungkan v_detail_hasil_pendataan (kode 1-9) dengan hitungan
  // baris ket_hasil IS NULL ("Belum Diproses") per petugas — dihitung DI
  // KLIEN dari ub_se2026_bps3172 langsung, karena tidak ada view yang
  // sudah menyediakannya (lihat catatan permintaan asli). Query ke tabel
  // dasar HANYA select("petugas,pml") dengan filter is null, supaya tetap
  // ringan walau baris UB bertambah banyak.
  async function fetchDetailHasilPendataanUBSupabase() {
    const client = getClient();
    const tbl = ubTables();
    const viewName = tbl.detailHasilPendataan || "v_detail_hasil_pendataan";
    const mainTable = tbl.ubMain || "ub_se2026_bps3172";

    let detailRows, belumRows;
    try {
      [detailRows, belumRows] = await Promise.all([
        fetchAllRows((from, to) => client.from(viewName).select("*").range(from, to)),
        fetchAllRows((from, to) => client.from(mainTable).select("petugas,pml").is("ket_hasil", null).range(from, to))
      ]);
    } catch (err) {
      throw new Error(`Gagal membaca ${viewName} / ${mainTable} dari Supabase: ${err.message}`);
    }

    const belumMap = new Map();
    (belumRows || []).forEach(r => {
      const petugas = String(r.petugas || "").trim();
      const pml = String(r.pml || "").trim();
      const key = petugas + "||" + pml;
      if (!belumMap.has(key)) belumMap.set(key, { petugas, pml, jumlah: 0 });
      belumMap.get(key).jumlah += 1;
    });

    return {
      detail: (detailRows || []).map(mapDetailHasilUBRow),
      belumDiproses: Array.from(belumMap.values())
    };
  }

  window.SupabaseEngine = {
    getClient,
    fetchMasterDataSupabase,
    fetchKategoriPetugasSupabase,
    fetchHeatmapSupabase,
    fetchProgresPetugasSupabase,
    fetchProgresHarianSupabase,
    fetchProgresKelurahanSupabase,
    fetchDataOverviewSupabase,
    fetchSyncLogSupabase,
    fetchAnomaliPendataanSupabase,
    fetchProgresPegawaiHarianUBSupabase,
    fetchKategoriKecamatanUBSupabase,
    fetchDetailHasilPendataanUBSupabase
  };

})();
