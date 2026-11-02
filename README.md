# Ruang Kelas Fisika

Website statis untuk membagikan materi dan menerima tugas siswa kelas XI dan XII lewat Google Form. Tidak perlu server, cukup GitHub Pages.

Siswa memilih tab **Kelas XI** atau **Kelas XII**, lalu semester dan topik. Tugas dan materi ikut berubah. Halaman mengingat kelas terakhir yang dipilih, dan kamu bisa membagikan link langsung ke satu kelas:

- `https://namakamu.github.io/?kelas=XI`
- `https://namakamu.github.io/?kelas=XII`

## Isi folder

| File | Fungsi |
|------|--------|
| `index.html` | Kerangka halaman |
| `style.css` | Tampilan |
| `script.js` | Logika (tab kelas, filter, hitung mundur, centang tugas) |
| `data.js` | **Satu-satunya file yang kamu edit**: daftar topik, tugas, materi |

## Pasang di GitHub Pages

1. Buat akun di github.com, lalu buat repository baru. Untuk alamat `namakamu.github.io`, beri nama repository `namakamu.github.io`.
2. Klik **Add file > Upload files**, tarik keempat file di atas, lalu **Commit changes**.
3. Buka **Settings > Pages**. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1 sampai 3 menit. Alamat situsmu muncul di bagian atas halaman Pages.

## Cara memperbarui isi

1. Buka `data.js` di repository, klik ikon pensil.
2. Salin satu blok `{ ... },` di bagian `TUGAS` atau `MATERI`, tempel di bawahnya, lalu ganti isinya.
3. Klik **Commit changes**. Situs ikut berubah dalam beberapa menit.

### Menambah tugas
```js
{
  id: "xi-fluida-latihan",           // unik, tanpa spasi
  kelas: "XI", semester: 1,
  topik: "Fluida Statis dan Dinamis", // sama persis dengan nama di KURIKULUM
  judul: "Soal Hukum Pascal dan Archimedes",
  deskripsi: "Kerjakan 6 soal, foto hasilnya.",
  deadline: "2026-11-27T23:59:00+08:00",
  formUrl: "https://forms.gle/...",
},
```
- `deadline`: gunakan `+08:00` untuk WITA, `+07:00` untuk WIB, `+09:00` untuk WIT.
- Status "Dibuka", "Segera berakhir" (kurang dari 3 hari), dan "Sudah lewat" berubah otomatis.
- Link Google Form: di Google Form klik **Kirim > ikon link > Salin**.

### Menambah materi
```js
{
  kelas: "XII", semester: 1, topik: "Arus Bolak-Balik (AC)",
  jenis: "Slide",                    // PDF, Slide, Video, atau Link
  tanggal: "2026-11-09",
  judul: "Rangkaian RLC",
  deskripsi: "Impedansi dan resonansi.",
  url: "https://drive.google.com/...",
},
```
- `url` bisa link Google Drive, YouTube, atau file yang kamu upload ke repository, misalnya `materi/rlc.pdf`.
- Untuk Google Drive: klik kanan file, **Bagikan**, ubah akses menjadi *Siapa saja yang memiliki link*, lalu salin link.

### Mengubah daftar topik
Edit bagian `KURIKULUM` di `data.js`. Nama topik di `TUGAS` dan `MATERI` harus sama persis dengan di sini, termasuk huruf besar dan tanda baca.

## Tips Google Form
- Tambahkan pertanyaan nama lengkap dan kelas, atau aktifkan pengumpulan email, supaya mudah mencocokkan data.
- Untuk menerima file, tambah pertanyaan *Upload file* (siswa perlu login akun Google).
- Satu form per tugas membuat rekap lebih rapi.
- Matikan **Menerima tanggapan** setelah tenggat jika ingin menutup pengumpulan.

## Catatan
- Centang "Sudah kukumpulkan" hanya tersimpan di browser siswa sebagai pengingat. Bukti pengumpulan tetap ada di tanggapan Google Form.
- Repository publik bisa dibaca siapa saja. Jangan masukkan data pribadi siswa di `data.js`.
