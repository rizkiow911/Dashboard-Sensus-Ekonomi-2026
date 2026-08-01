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

  window.SupabaseEngine = {
    getClient,
    fetchMasterDataSupabase,
    fetchKategoriPetugasSupabase,
    fetchHeatmapSupabase,
    fetchProgresPetugasSupabase,
    fetchProgresKelurahanSupabase,
    fetchDataOverviewSupabase,
    fetchSyncLogSupabase
  };

})();
