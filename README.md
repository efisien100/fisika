# Ruang Kelas Fisika

Website statis untuk membagikan materi dan menerima tugas siswa kelas X, XI, dan XII lewat Google Form, dengan halaman admin untuk mengisi konten tanpa mengedit kode.

- Situs siswa: `https://namakamu.github.io/` (tab Kelas X, XI, XII)
- Link langsung per kelas: `?kelas=X`, `?kelas=XI`, atau `?kelas=XII`
- Halaman admin: `https://namakamu.github.io/admin.html` (atau klik **Masuk guru** di bagian bawah situs)
- Tema: tombol **Tema** di pojok kanan atas, 5 pilihan (Buku Tulis, Malam, Papan Tulis, Permen, Laut)

## Isi folder

| File | Fungsi |
|------|--------|
| `index.html`, `style.css`, `script.js`, `theme.js` | Situs untuk siswa (`theme.js` = pilihan tema) |
| `admin.html`, `admin.css`, `admin.js` | Halaman admin |
| `data.json` | Seluruh isi situs: pengaturan, topik, tugas, materi |
| `materi/` | Folder file yang diunggah lewat admin (dibuat otomatis) |

## Menghubungkan ke github.io (GitHub Pages)

1. Daftar di github.com (gratis), lalu klik **+ > New repository**.
2. **Nama repository** menentukan alamat situs:
   - `namakamu.github.io` (persis sama dengan username-mu) menghasilkan alamat `https://namakamu.github.io/`
   - nama lain, mis. `fisika`, menghasilkan `https://namakamu.github.io/fisika/`
   Pilih **Public**, lalu **Create repository**.
3. Ekstrak zip di komputer. Di halaman repository klik **uploading an existing file**, lalu tarik **isi folder** (file `index.html`, `admin.html`, `data.json`, dan seterusnya, bukan folder pembungkusnya). Klik **Commit changes**.
4. Buka **Settings > Pages**. Pada *Build and deployment* pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
5. Tunggu 1 sampai 3 menit. Alamat situs muncul di bagian atas halaman Pages (*Your site is live at ...*). Buka dan bagikan ke siswa.
6. Jika muncul 404, pastikan `index.html` ada di lapisan paling atas repository, bukan di dalam folder.

Domain sendiri (mis. `kelasfisika.sch.id`) bisa dipasang di **Settings > Pages > Custom domain**.

## Membuat token untuk halaman admin (sekali saja)

Halaman admin menyimpan perubahan dengan membuat commit ke repository-mu, jadi ia butuh token.

1. GitHub: foto profil > **Settings** > **Developer settings** > **Personal access tokens** > **Fine-grained tokens** > **Generate new token**.
2. Beri nama (mis. "admin kelas") dan pilih masa berlaku.
3. **Repository access**: *Only select repositories*, pilih repository situs ini.
4. **Permissions > Repository permissions**: ubah **Contents** menjadi **Read and write**.
5. **Generate token**, salin. Token hanya tampil sekali.

## Cara masuk admin

1. Buka `https://namakamu.github.io/admin.html`, atau klik **Masuk guru** di bagian paling bawah situs.
2. Isi **Repository** (`namakamu/namakamu.github.io`), **Branch** (`main`), dan **Token** yang dibuat pada langkah di atas, lalu klik **Masuk**.
3. Selesai bekerja, klik **Keluar** di kanan atas, terutama di komputer bersama.

## Memakai halaman admin

1. Buka `/admin.html`, isi repository (`namakamu/namakamu.github.io`), branch (`main`), dan token, lalu **Masuk**.
2. Tab **Tugas** dan **Materi**: tambah, ubah, atau hapus. Untuk materi, kamu bisa menempel link Google Drive atau YouTube, atau **Unggah file** (maksimal 25 MB) yang disimpan di folder `materi/`.
3. Tab **Topik**: tambah, ubah nama, urutkan, atau hapus topik per kelas dan semester. Topik kelas X hanya contoh, sesuaikan dengan kurikulummu. Mengubah nama topik ikut memperbarui tugas dan materi yang memakainya. Topik yang masih dipakai tidak bisa dihapus.
4. Tab **Pengaturan**: nama guru, tahun ajaran, zona waktu tenggat (WIB, WITA, WIT), **tema bawaan**, kalimat sambutan, dan langkah mengumpulkan tugas. Siswa tetap bisa memilih tema sendiri, dan pilihannya diingat di perangkat mereka.
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
