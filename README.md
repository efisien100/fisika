# Ruang Kelas Digital

Website statis untuk membagikan materi dan menerima tugas siswa lewat Google Form. Tidak perlu server, cukup GitHub Pages.

## Isi folder

| File | Fungsi |
|------|--------|
| `index.html` | Kerangka halaman |
| `style.css` | Tampilan |
| `script.js` | Logika (hitung mundur, filter materi, centang tugas) |
| `data.js` | **Satu-satunya file yang kamu edit**: nama kelas, tugas, materi |

## Pasang di GitHub Pages

1. Buat akun di github.com, lalu buat repository baru. Untuk alamat `namakamu.github.io`, beri nama repository `namakamu.github.io`. Nama lain juga boleh (alamatnya jadi `namakamu.github.io/nama-repo`).
2. Klik **Add file > Upload files**, tarik keempat file di atas (`index.html`, `style.css`, `script.js`, `data.js`), lalu **Commit changes**.
3. Buka **Settings > Pages**. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1 sampai 3 menit. Alamat situsmu muncul di bagian atas halaman Pages.

## Cara memperbarui isi

1. Buka `data.js` di repository, klik ikon pensil untuk mengedit.
2. Ubah atau tambah tugas dan materi. Salin satu blok `{ ... },` lalu ganti isinya.
3. Klik **Commit changes**. Situs ikut berubah dalam beberapa menit.

### Tugas
- `formUrl`: tempel link Google Form (di Google Form: **Kirim > ikon link > Salin**).
- `deadline`: format `2026-11-06T23:59:00+08:00`. Gunakan `+08:00` untuk WITA, `+07:00` untuk WIB, `+09:00` untuk WIT.
- Status "Dibuka", "Segera berakhir" (kurang dari 3 hari), dan "Sudah lewat" berubah otomatis.

### Materi
- `url` bisa berupa link Google Drive, YouTube, atau file yang kamu upload ke repository, misalnya `materi/algoritma.pdf`.
- Untuk Google Drive: klik kanan file, **Bagikan**, ubah akses menjadi *Siapa saja yang memiliki link*, lalu salin link.

## Tips Google Form
- Aktifkan **Kumpulkan alamat email** atau tambah kolom nama dan kelas, supaya mudah mencocokkan data.
- Untuk menerima file, tambah pertanyaan *Upload file* (siswa perlu login akun Google).
- Gunakan satu form per tugas agar rekap lebih rapi, atau satu form dengan kolom "Judul tugas".
- Tutup form otomatis setelah tenggat dengan add-on seperti formLimiter, atau matikan *Menerima tanggapan* secara manual.

## Catatan
- Centang "Sudah kukumpulkan" hanya tersimpan di browser siswa sebagai pengingat. Bukti pengumpulan yang sah tetap di tanggapan Google Form.
- Jangan masukkan data pribadi siswa di `data.js`, karena repository publik bisa dibaca siapa saja.
