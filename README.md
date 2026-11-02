# Ruang Kelas Fisika

Website statis untuk membagikan materi dan menerima tugas siswa kelas XI dan XII lewat Google Form, dengan halaman admin untuk mengisi konten tanpa mengedit kode.

- Situs siswa: `https://namakamu.github.io/` (tab Kelas XI dan Kelas XII)
- Link langsung per kelas: `?kelas=XI` atau `?kelas=XII`
- Halaman admin: `https://namakamu.github.io/admin.html`

## Isi folder

| File | Fungsi |
|------|--------|
| `index.html`, `style.css`, `script.js` | Situs untuk siswa |
| `admin.html`, `admin.css`, `admin.js` | Halaman admin |
| `data.json` | Seluruh isi situs: pengaturan, topik, tugas, materi |
| `materi/` | Folder file yang diunggah lewat admin (dibuat otomatis) |

## Pasang di GitHub Pages

1. Buat repository baru di GitHub, misalnya `namakamu.github.io`.
2. Upload semua file di zip (`Add file > Upload files`), lalu **Commit changes**.
3. Buka **Settings > Pages**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1 sampai 3 menit, lalu buka alamat situsmu.

## Membuat token untuk halaman admin (sekali saja)

Halaman admin menyimpan perubahan dengan membuat commit ke repository-mu, jadi ia butuh token.

1. GitHub: foto profil > **Settings** > **Developer settings** > **Personal access tokens** > **Fine-grained tokens** > **Generate new token**.
2. Beri nama (mis. "admin kelas") dan pilih masa berlaku.
3. **Repository access**: *Only select repositories*, pilih repository situs ini.
4. **Permissions > Repository permissions**: ubah **Contents** menjadi **Read and write**.
5. **Generate token**, salin. Token hanya tampil sekali.

## Memakai halaman admin

1. Buka `/admin.html`, isi repository (`namakamu/namakamu.github.io`), branch (`main`), dan token, lalu **Masuk**.
2. Tab **Tugas** dan **Materi**: tambah, ubah, atau hapus. Untuk materi, kamu bisa menempel link Google Drive atau YouTube, atau **Unggah file** (maksimal 25 MB) yang disimpan di folder `materi/`.
3. Tab **Topik**: tambah, ubah nama, urutkan, atau hapus topik per kelas dan semester. Mengubah nama topik ikut memperbarui tugas dan materi yang memakainya. Topik yang masih dipakai tidak bisa dihapus.
4. Tab **Pengaturan**: nama guru, tahun ajaran, zona waktu tenggat (WIB, WITA, WIT), kalimat sambutan, dan langkah mengumpulkan tugas.
5. Klik **Simpan ke GitHub**. Situs siswa berubah dalam 1 sampai 3 menit.

Perubahan baru terbit setelah kamu klik **Simpan ke GitHub**. Jika ada perubahan yang belum disimpan, bilah di bagian atas berwarna kuning.

### Tanpa token (mode lokal)
Tombol **Coba tanpa GitHub** membuka data dari situs. Setelah mengedit, klik **Unduh data.json**, lalu ganti file `data.json` di repository secara manual (`Add file > Upload files`).

## Keamanan

- Siapa pun bisa membuka `admin.html`, tetapi tanpa token tidak ada yang bisa mengubah apa pun. Jangan bagikan token ke siapa pun, termasuk siswa.
- Token tersimpan di tab browser saja dan hilang saat tab ditutup, kecuali kamu mencentang **Ingat token di perangkat ini**. Jangan centang di komputer bersama.
- Pakai token dengan akses ke satu repository saja dan masa berlaku terbatas. Jika token bocor, hapus di GitHub dan buat yang baru.
- Repository publik bisa dibaca siapa saja. Jangan masukkan data pribadi siswa.
- Jika kamu menyimpan dua kali dari dua perangkat sekaligus, GitHub akan menolak simpanan kedua. Muat ulang halaman admin lalu ulangi.

## Tips Google Form
- Tambahkan pertanyaan nama lengkap dan kelas, atau aktifkan pengumpulan email, supaya mudah mencocokkan data.
- Untuk menerima file, tambah pertanyaan *Upload file* (siswa perlu login akun Google).
- Satu form per tugas membuat rekap lebih rapi.
- Matikan **Menerima tanggapan** setelah tenggat jika ingin menutup pengumpulan.

## Catatan
- Centang "Sudah kukumpulkan" di situs siswa hanya tersimpan di browser siswa sebagai pengingat. Bukti pengumpulan tetap ada di tanggapan Google Form.
- Situs memuat `data.json` saat dibuka, jadi harus dibuka lewat alamat `github.io` (bukan dengan klik dua kali file `index.html` di komputer).
