(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const STORE = "kelas-selesai-v1";

  /* ---------- Penyimpanan centang ---------- */
  function loadDone() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function saveDone(obj) {
    try { localStorage.setItem(STORE, JSON.stringify(obj)); } catch (e) { /* abaikan */ }
  }
  let done = loadDone();

  /* ---------- Util ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  function fmtJam(d) { return pad(d.getHours()) + "." + pad(d.getMinutes()); }
  function statusOf(t) {
    const ms = new Date(t.deadline) - Date.now();
    if (ms < 0) return "closed";
    if (ms < 3 * 24 * 3600 * 1000) return "soon";
    return "open";
  }
  function statusLabel(s) {
    return { open: "Dibuka", soon: "Segera berakhir", closed: "Sudah lewat" }[s];
  }
  function isPlaceholder(url) { return /GANTI/i.test(url); }

  /* ---------- Isi identitas ---------- */
  function fillIdentity() {
    document.title = KELAS.mapel + " " + KELAS.kelas + " · Ruang Kelas";
    $("#brandName").textContent = KELAS.mapel + " " + KELAS.kelas;
    $("#heroMapel").textContent = KELAS.mapel;
    $("#heroSapaan").textContent = KELAS.sapaan;
    $("#labKelas").textContent = KELAS.kelas;
    $("#labTahun").textContent = KELAS.tahunAjaran;
    $("#labGuru").textContent = KELAS.guru;
    $("#footMapel").textContent = KELAS.mapel;
    $("#footKelas").textContent = "Kelas " + KELAS.kelas;
  }

  /* ---------- Tugas ---------- */
  function renderTasks() {
    const list = $("#taskList");
    const sorted = TUGAS.slice().sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    list.innerHTML = sorted.map((t) => {
      const d = new Date(t.deadline);
      const st = statusOf(t);
      const isDone = !!done[t.id];
      const badge = isDone
        ? '<span class="status done">Sudah dikumpulkan</span>'
        : '<span class="status ' + st + '">' + statusLabel(st) + "</span>";
      const btnText = st === "closed" ? "Kumpulkan (terlambat)" : "Kumpulkan";
      return (
        '<li class="task' + (isDone ? " is-done" : "") + (st === "closed" ? " is-closed" : "") + '">' +
          '<div class="task-date"><b>' + d.getDate() + "</b><span>" + BULAN[d.getMonth()] + "</span></div>" +
          "<div>" +
            "<h3>" + esc(t.judul) + "</h3>" +
            "<p>" + esc(t.deskripsi) + "</p>" +
            '<div class="task-meta">' +
              '<span class="tag">' + esc(t.topik) + "</span>" +
              "<span>" + HARI[d.getDay()] + ", " + d.getDate() + " " + BULAN[d.getMonth()] + " pukul " + fmtJam(d) + "</span>" +
              badge +
            "</div>" +
          "</div>" +
          '<div class="task-side">' +
            '<a class="btn btn-primary" href="' + esc(t.formUrl) + '" target="_blank" rel="noopener" data-form="' + esc(t.formUrl) + '">' + btnText + "</a>" +
            '<label class="check"><input type="checkbox" data-id="' + esc(t.id) + '"' + (isDone ? " checked" : "") + "> Sudah kukumpulkan</label>" +
          "</div>" +
        "</li>"
      );
    }).join("");

    const sisa = TUGAS.filter((t) => !done[t.id] && statusOf(t) !== "closed").length;
    $("#tugasRingkas").textContent =
      sisa === 0 ? "Semua tugas aktif sudah kamu kumpulkan." : sisa + " tugas masih menunggu kamu.";
  }

  $("#taskList").addEventListener("change", (e) => {
    const cb = e.target.closest("input[data-id]");
    if (!cb) return;
    if (cb.checked) done[cb.dataset.id] = true; else delete done[cb.dataset.id];
    saveDone(done);
    renderTasks();
    renderNext();
    const again = document.querySelector('input[data-id="' + cb.dataset.id + '"]');
    if (again) again.focus();
  });

  $("#taskList").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-form]");
    if (a && isPlaceholder(a.dataset.form)) {
      e.preventDefault();
      alert("Link Google Form belum diisi. Guru perlu mengganti formUrl di data.js.");
    }
  });

  /* ---------- Tenggat terdekat + hitung mundur ---------- */
  let nextTask = null;

  function pickNext() {
    const upcoming = TUGAS
      .filter((t) => !done[t.id] && new Date(t.deadline) > Date.now())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    return upcoming[0] || null;
  }

  function renderNext() {
    nextTask = pickNext();
    const title = $("#nextTitle");
    const btn = $("#nextBtn");
    const cap = $("#nextCaption");
    if (!nextTask) {
      cap.textContent = "Tenggat terdekat";
      title.textContent = "Tidak ada tugas yang menunggu.";
      $("#countdown").innerHTML = '<p class="cd-text">Santai dulu, atau baca materi baru.</p>';
      btn.hidden = true;
      return;
    }
    cap.textContent = "Tenggat terdekat";
    title.textContent = nextTask.judul;
    btn.hidden = false;
    btn.href = nextTask.formUrl;
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.dataset.form = nextTask.formUrl;
    tick();
  }

  function tick() {
    if (!nextTask) return;
    const ms = new Date(nextTask.deadline) - Date.now();
    if (ms <= 0) { renderTasks(); renderNext(); return; }
    const m = Math.floor(ms / 60000);
    const hari = Math.floor(m / 1440);
    const jam = Math.floor((m % 1440) / 60);
    const mnt = m % 60;
    const late = ms < 24 * 3600 * 1000 ? " late" : "";
    $("#countdown").innerHTML =
      '<div class="cd-unit' + late + '"><b>' + hari + "</b><span>hari</span></div>" +
      '<div class="cd-unit' + late + '"><b>' + pad(jam) + "</b><span>jam</span></div>" +
      '<div class="cd-unit' + late + '"><b>' + pad(mnt) + "</b><span>menit</span></div>";
  }

  $("#nextBtn").addEventListener("click", (e) => {
    if (isPlaceholder(e.currentTarget.dataset.form || "")) {
      e.preventDefault();
      alert("Link Google Form belum diisi. Guru perlu mengganti formUrl di data.js.");
    }
  });

  /* ---------- Materi ---------- */
  let topikAktif = "Semua";
  let kata = "";

  function renderChips() {
    const all = ["Semua"].concat(TOPIK);
    $("#chips").innerHTML = all.map((t) =>
      '<button type="button" class="chip" aria-pressed="' + (t === topikAktif) + '" data-topik="' + esc(t) + '">' + esc(t) + "</button>"
    ).join("");
  }

  function renderMateri() {
    const q = kata.trim().toLowerCase();
    const rows = MATERI
      .filter((m) => topikAktif === "Semua" || m.topik === topikAktif)
      .filter((m) => !q || (m.judul + " " + m.deskripsi + " " + m.topik).toLowerCase().includes(q))
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));

    $("#matList").innerHTML = rows.map((m) => {
      const d = new Date(m.tanggal + "T00:00:00");
      const aksi = m.jenis === "Video" ? "Tonton" : m.jenis === "Link" ? "Baca" : "Buka";
      const ext = /^https?:/i.test(m.url);
      return (
        '<li class="mat" data-topik="' + esc(m.topik) + '">' +
          "<h3>" + esc(m.judul) + "</h3>" +
          "<p>" + esc(m.deskripsi) + "</p>" +
          '<div class="mat-foot">' +
            '<span><span class="type">' + esc(m.jenis) + "</span> · " + d.getDate() + " " + BULAN[d.getMonth()] + "</span>" +
            '<a class="mat-open" href="' + esc(m.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + aksi + " " + esc(m.jenis.toLowerCase()) + "</a>" +
          "</div>" +
        "</li>"
      );
    }).join("");
    $("#matEmpty").hidden = rows.length > 0;
  }

  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    topikAktif = b.dataset.topik;
    renderChips();
    renderMateri();
    const again = document.querySelector('.chip[data-topik="' + topikAktif + '"]');
    if (again) again.focus();
  });
  $("#search").addEventListener("input", (e) => { kata = e.target.value; renderMateri(); });

  /* ---------- Langkah ---------- */
  function renderSteps() {
    $("#steps").innerHTML = LANGKAH.map((s) => "<li>" + esc(s) + "</li>").join("");
  }

  /* ---------- Mulai ---------- */
  fillIdentity();
  renderTasks();
  renderNext();
  renderChips();
  renderMateri();
  renderSteps();
  setInterval(tick, 30000);
})();
