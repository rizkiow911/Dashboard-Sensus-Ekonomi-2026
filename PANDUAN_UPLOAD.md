# Panduan Deploy & Uji Coba — Upload Data Terbaru

Ini langkah untuk menyalakan koneksi Halaman Utama + menu Upload,
lengkap dengan cara mengujinya. Ikuti urutan ini.

---

## Bagian A — Cek koneksi baca (Halaman Utama)

Ini **tidak butuh** langkah tambahan — sudah aktif begitu kamu upload
ulang folder ini ke hosting-mu (GitHub Pages/dst).

1. Buka `index.html`.
2. Perhatikan badge di kanan atas header:
   - **"Diperbarui dari Google Sheet"** (titik teal) = sudah tersambung ke tab `Sheet1` yang asli.
   - **"Mode demo (data contoh)"** (titik kuning) = masih gagal baca. Buka console browser (F12) untuk lihat pesan error persisnya.
3. **Tes responsif:** buka tab `Sheet1` di Google Sheet di tab browser lain, ubah salah satu angka (mis. kolom `Prelist Usaha` di satu baris), lalu tunggu maksimal 45 detik (sesuai `refreshSeconds`) — angka KPI di Halaman Utama akan berubah sendiri tanpa refresh manual.

---

## Bagian B — Deploy Apps Script (supaya menu Upload bisa menulis ke Sheet)

1. Buka Google Sheet **Master Data** → menu **Extensions → Apps Script**.
2. Hapus isi default `Code.gs`, lalu tempel seluruh isi file
   `apps-script/Code.gs` dari paket ini.
3. Klik ikon gerigi **Project Settings** di sisi kiri → scroll ke
   **Script Properties** → **Add script property**:
   - Property: `UPLOAD_TOKEN`
   - Value: buat kata sandi sendiri, mis. `jaktim-se2026-9x`
   - Simpan.
4. Klik **Deploy → New deployment**.
   - Klik ikon gerigi di sebelah "Select type" → pilih **Web app**.
   - Execute as: **Me** (akun Google-mu).
   - Who has access: **Anyone**.
   - Klik **Deploy**, izinkan akses saat diminta (klik "Advanced" →
     "Go to (nama project) (unsafe)" kalau muncul peringatan — ini
     normal untuk script buatan sendiri).
5. Salin URL yang diakhiri `/exec`.
6. Buka `shared/shared-config.js`, isi:
   ```js
   uploadEndpoint: "TEMPEL_URL_DI_SINI",
   ```
7. Upload ulang file `shared-config.js` yang sudah diisi ke hosting-mu.

> **Setiap kali kamu edit `Code.gs`**, kamu harus buat **New deployment**
> lagi (bukan cuma Save) supaya URL `/exec` memakai kode terbaru.

---

## Bagian C — Uji coba aman (SANGAT disarankan sebelum ke tab asli)

Sebelum mengarahkan upload ke tab `Sheet1` yang asli (berisi data
kerja PPL/PML sungguhan), coba dulu di tab duplikat:

1. Di Google Sheet, klik kanan tab `Sheet1` → **Duplicate**.
   Ganti nama tab hasil duplikat jadi `Sheet1 (Test)`.
2. Buka `upload-data.html` di dashboard.
3. Di kolom **"Nama tab tujuan"**, ganti isinya jadi `Sheet1 (Test)`.
4. Siapkan file Excel (.xlsx) percobaan:
   - Baris pertama = 52 nama kolom **persis** seperti di
     `shared/shared-config.js` → `masterDataColumns` (nama, jumlah, urutan sama).
   - Cara termudah: **export tab `Sheet1 (Test)` ke .xlsx dari
     Google Sheet** (File → Download → Microsoft Excel), lalu ubah
     beberapa angka di dalamnya sebagai data uji.
5. Pilih file itu di form upload → dashboard akan otomatis validasi
   kolom & tampilkan pratinjau.
6. Kalau status **"Valid"**, isi token (`UPLOAD_TOKEN` yang kamu buat
   di Bagian B) → klik **Kirim ke Google Sheet**.
7. Cek tab `Sheet1 (Test)` di Sheet — isinya harus berubah sesuai
   file yang diunggah. Cek juga tab `Log_Upload` (dibuat otomatis) —
   harus ada 1 baris log baru.
8. Kalau semua beres, ulangi dengan **"Nama tab tujuan" = `Sheet1`**
   untuk mulai memakai yang asli.

---

## Troubleshooting cepat

| Gejala | Kemungkinan penyebab |
|---|---|
| Halaman Utama tetap "Mode demo" | Nama tab di `shared-config.js` (`tabs.masterData`) tidak persis sama dengan nama tab di Sheet, atau Sheet belum di-share "Anyone with the link — Viewer" |
| Validasi upload selalu bilang "Kolom hilang/tak dikenal" | File Excel-mu punya nama kolom/urutan beda dari `masterDataColumns` — kolom di Sheet sering berubah kalau ada yang edit header manual |
| Tombol "Kirim ke Google Sheet" nonaktif terus | `uploadEndpoint` di `shared-config.js` masih kosong, atau file belum lolos validasi |
| Klik kirim → "Gagal menghubungi Apps Script" | URL endpoint salah, atau Web App belum di-deploy dengan akses "Anyone" |
| Klik kirim → "Token tidak valid" | Token di form tidak sama dengan `UPLOAD_TOKEN` di Script Properties |
| Klik kirim → "Jumlah kolom tidak cocok" | Header baris 1 di tab tujuan (di Sheet) berbeda jumlah kolomnya dari file yang diunggah |
