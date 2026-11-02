/* ============================================================
   FILE INI SATU-SATUNYA YANG PERLU KAMU EDIT.
   Ganti isi di bawah, simpan, lalu upload ulang ke GitHub.
   ============================================================ */

const KELAS = {
  mapel: "Informatika",
  kelas: "XI IPA 2",
  guru: "Pak Seno",
  tahunAjaran: "2026/2027",
  sapaan: "Semua materi dan tugas ada di sini. Cek tenggatnya, kerjakan, lalu kumpulkan lewat tombol di tiap tugas.",
};

/* Daftar bab / topik. Dipakai sebagai filter di bagian Materi. */
const TOPIK = ["Algoritma", "Pemrograman", "Jaringan", "Data"];

/* ---------- TUGAS ----------
   id        : unik, tanpa spasi (dipakai untuk centang "sudah dikumpulkan")
   deadline  : format "TAHUN-BULAN-TANGGALTJAM:MENIT:00+08:00" (+08:00 = WITA, +07:00 = WIB)
   formUrl   : link Google Form pengumpulan tugas
*/
const TUGAS = [
  {
    id: "algo-flowchart",
    judul: "Flowchart Menghitung Nilai Rata-rata",
    topik: "Algoritma",
    deskripsi: "Buat flowchart yang menerima 5 nilai lalu menampilkan rata-rata dan keterangan lulus atau remedial. Foto atau ekspor ke PDF.",
    deadline: "2026-11-06T23:59:00+08:00",
    formUrl: "https://forms.gle/GANTI-DENGAN-LINK-FORM-1",
  },
  {
    id: "python-kalkulator",
    judul: "Program Kalkulator Sederhana Python",
    topik: "Pemrograman",
    deskripsi: "Buat kalkulator yang bisa tambah, kurang, kali, bagi. Kumpulkan file .py dan screenshot hasil jalannya.",
    deadline: "2026-11-13T23:59:00+08:00",
    formUrl: "https://forms.gle/GANTI-DENGAN-LINK-FORM-2",
  },
  {
    id: "jaringan-topologi",
    judul: "Gambar Topologi Jaringan Sekolah",
    topik: "Jaringan",
    deskripsi: "Gambar topologi jaringan di lab komputer sekolah beserta keterangan perangkat yang dipakai.",
    deadline: "2026-11-20T23:59:00+08:00",
    formUrl: "https://forms.gle/GANTI-DENGAN-LINK-FORM-3",
  },
  {
    id: "data-survei",
    judul: "Mini Survei Kelas dan Grafiknya",
    topik: "Data",
    deskripsi: "Survei 10 teman tentang aplikasi favorit, olah di spreadsheet, lalu buat satu grafik dan tulis kesimpulannya.",
    deadline: "2026-10-30T23:59:00+08:00",
    formUrl: "https://forms.gle/GANTI-DENGAN-LINK-FORM-4",
  },
];

/* ---------- MATERI ----------
   jenis : "PDF" | "Slide" | "Video" | "Link"
   url   : link file (Google Drive, YouTube, dll.) atau path file di repo, mis. "materi/algoritma.pdf"
*/
const MATERI = [
  {
    judul: "Pengantar Algoritma dan Flowchart",
    topik: "Algoritma",
    jenis: "Slide",
    tanggal: "2026-10-12",
    deskripsi: "Apa itu algoritma, simbol flowchart, dan contoh membuat nasi goreng versi flowchart.",
    url: "#",
  },
  {
    judul: "Percabangan dan Perulangan",
    topik: "Algoritma",
    jenis: "PDF",
    tanggal: "2026-10-19",
    deskripsi: "Rangkuman if-else dan loop dengan latihan soal beserta kunci jawaban.",
    url: "#",
  },
  {
    judul: "Python dari Nol: Variabel dan Tipe Data",
    topik: "Pemrograman",
    jenis: "Video",
    tanggal: "2026-10-26",
    deskripsi: "Video 15 menit yang mengikuti praktik di kelas. Siapkan Python atau buka Google Colab.",
    url: "#",
  },
  {
    judul: "Fungsi dan Input di Python",
    topik: "Pemrograman",
    jenis: "PDF",
    tanggal: "2026-11-02",
    deskripsi: "Cara membuat fungsi, menerima input, dan mengubah tipe data. Dilengkapi contoh kalkulator.",
    url: "#",
  },
  {
    judul: "Jenis dan Topologi Jaringan",
    topik: "Jaringan",
    jenis: "Slide",
    tanggal: "2026-10-14",
    deskripsi: "LAN, MAN, WAN, serta topologi bus, star, ring, dan mesh beserta kelebihannya.",
    url: "#",
  },
  {
    judul: "Cara Kerja Internet",
    topik: "Jaringan",
    jenis: "Link",
    tanggal: "2026-10-21",
    deskripsi: "Artikel pendamping tentang alamat IP, DNS, dan perjalanan satu halaman web ke layarmu.",
    url: "#",
  },
  {
    judul: "Mengolah Data di Spreadsheet",
    topik: "Data",
    jenis: "Video",
    tanggal: "2026-10-05",
    deskripsi: "Rumus dasar, pengurutan, dan cara membuat grafik batang dan lingkaran.",
    url: "#",
  },
];

/* ---------- LANGKAH MENGUMPULKAN (boleh diubah) ---------- */
const LANGKAH = [
  "Kerjakan tugas sesuai petunjuk dan simpan hasilnya sebagai file atau foto.",
  "Klik tombol Kumpulkan di kartu tugas. Google Form akan terbuka di tab baru.",
  "Isi nama lengkap, kelas, lalu unggah file. Periksa lagi sebelum klik Kirim.",
  "Kembali ke sini dan centang Sudah kukumpulkan agar kamu tidak lupa.",
];
