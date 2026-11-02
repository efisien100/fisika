(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const STORE_DONE = "kelas-selesai-v1";
  const STORE_KELAS = "kelas-pilihan-v1";
  const KELAS_LIST = Object.keys(KURIKULUM);

  /* ---------- Penyimpanan ---------- */
  function lsGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* abaikan */ }
  }
  let done = lsGet(STORE_DONE, {});

  /* ---------- Util ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const fmtJam = (d) => pad(d.getHours()) + "." + pad(d.getMinutes());
  function statusOf(t) {
    const ms = new Date(t.deadline) - Date.now();
    if (ms < 0) return "closed";
    return ms < 3 * 24 * 3600 * 1000 ? "soon" : "open";
  }
  const statusLabel = (s) => ({ open: "Dibuka", soon: "Segera berakhir", closed: "Sudah lewat" }[s]);
  const isPlaceholder = (url) => /GANTI/i.test(url || "");
  function semesterSekarang() {
    const bln = new Date().getMonth() + 1; // Juli-Des = semester 1
    return bln >= 7 ? 1 : 2;
  }

  /* ---------- State ---------- */
  const params = new URLSearchParams(location.search);
  const fromUrl = (params.get("kelas") || "").toUpperCase();
  const state = {
    kelas: KELAS_LIST.includes(fromUrl) ? fromUrl : (KELAS_LIST.includes(lsGet(STORE_KELAS, "")) ? lsGet(STORE_KELAS, "") : KELAS_LIST[0]),
    semester: semesterSekarang(),
    topik: "Semua",
    q: "",
  };

  const topikList = () => KURIKULUM[state.kelas][state.semester] || [];
  const inScope = (x) => x.kelas === state.kelas && x.semester === state.semester && (state.topik === "Semua" || x.topik === state.topik);

  /* ---------- Identitas ---------- */
  function fillIdentity() {
    $("#brandName").textContent = "Ruang Kelas " + SITUS.mapel;
    $("#heroMapel").textContent = SITUS.mapel;
    $("#heroSapaan").textContent = SITUS.sapaan;
    $("#labTahun").textContent = SITUS.tahunAjaran;
    $("#labGuru").textContent = SITUS.guru;
    $("#footMapel").textContent = SITUS.mapel;
  }

  function fillKelas() {
    $("#heroKelas").textContent = state.kelas;
    $("#labKelas").textContent = "Kelas " + state.kelas;
    document.title = SITUS.mapel + " kelas " + state.kelas + " · Ruang Kelas";
    lsSet(STORE_KELAS, state.kelas);
    try {
      const u = new URL(location.href);
      u.searchParams.set("kelas", state.kelas);
      history.replaceState(null, "", u);
    } catch (e) { /* abaikan */ }
  }

  /* ---------- Pemilih kelas / semester / topik ---------- */
  function countFor(topik) {
    const f = (x) => x.kelas === state.kelas && x.semester === state.semester && (topik === "Semua" || x.topik === topik);
    return TUGAS.filter(f).length + MATERI.filter(f).length;
  }

  function renderTabs() {
    $("#tabs").innerHTML = KELAS_LIST.map((k) =>
      '<button type="button" class="tab" role="tab" id="tab-' + esc(k) + '" aria-selected="' + (k === state.kelas) + '" tabindex="' + (k === state.kelas ? 0 : -1) + '" data-kelas="' + esc(k) + '">Kelas ' + esc(k) + "</button>"
    ).join("");
  }

  function renderSeg() {
    $("#seg").innerHTML = [1, 2].map((s) =>
      '<button type="button" class="seg-btn" aria-pressed="' + (s === state.semester) + '" data-smt="' + s + '">Semester ' + s + "</button>"
    ).join("");
  }

  function renderChips() {
    const all = ["Semua"].concat(topikList());
    $("#chips").innerHTML = all.map((t) => {
      const n = countFor(t);
      return '<button type="button" class="chip" aria-pressed="' + (t === state.topik) + '" data-topik="' + esc(t) + '">' +
        esc(t === "Semua" ? "Semua topik" : t) + ' <span class="chip-n">' + n + "</span></button>";
    }).join("");
  }

  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b || b.dataset.kelas === state.kelas) return;
    pilihKelas(b.dataset.kelas);
  });
  $("#tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = KELAS_LIST.indexOf(state.kelas);
    const n = KELAS_LIST[(i + (e.key === "ArrowRight" ? 1 : -1) + KELAS_LIST.length) % KELAS_LIST.length];
    pilihKelas(n);
    const t = $("#tab-" + n); if (t) t.focus();
  });

  function pilihKelas(k) {
    state.kelas = k;
    state.topik = "Semua";
    state.q = "";
    $("#search").value = "";
    refreshAll();
  }

  $("#seg").addEventListener("click", (e) => {
    const b = e.target.closest(".seg-btn");
    if (!b) return;
    state.semester = Number(b.dataset.smt);
    state.topik = "Semua";
    renderSeg(); renderChips(); renderTasks(); renderMateri();
    const again = document.querySelector('.seg-btn[data-smt="' + state.semester + '"]');
    if (again) again.focus();
  });

  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.topik = b.dataset.topik;
    renderChips(); renderTasks(); renderMateri();
    const again = [...document.querySelectorAll(".chip")].find((c) => c.dataset.topik === state.topik);
    if (again) again.focus();
  });

  $("#search").addEventListener("input", (e) => { state.q = e.target.value; renderMateri(); });

  /* ---------- Tugas ---------- */
  function renderTasks() {
    const rows = TUGAS.filter(inScope).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    $("#taskList").innerHTML = rows.map((t) => {
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

    $("#taskEmpty").hidden = rows.length > 0;
    const sisa = rows.filter((t) => !done[t.id] && statusOf(t) !== "closed").length;
    $("#tugasRingkas").textContent =
      rows.length === 0 ? "" : (sisa === 0 ? "Semua tugas aktif di sini sudah kamu kumpulkan." : sisa + " tugas masih menunggu kamu.");
  }

  $("#taskList").addEventListener("change", (e) => {
    const cb = e.target.closest("input[data-id]");
    if (!cb) return;
    if (cb.checked) done[cb.dataset.id] = true; else delete done[cb.dataset.id];
    lsSet(STORE_DONE, done);
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

  /* ---------- Tenggat terdekat + hitung mundur (seluruh semester untuk kelas terpilih) ---------- */
  let nextTask = null;

  function renderNext() {
    nextTask = TUGAS
      .filter((t) => t.kelas === state.kelas && !done[t.id] && new Date(t.deadline) > Date.now())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0] || null;

    const btn = $("#nextBtn");
    if (!nextTask) {
      $("#nextTitle").textContent = "Tidak ada tugas yang menunggu.";
      $("#countdown").innerHTML = '<p class="cd-text">Santai dulu, atau baca materi baru.</p>';
      btn.hidden = true;
      return;
    }
    $("#nextTitle").textContent = nextTask.judul;
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
    const late = ms < 24 * 3600 * 1000 ? " late" : "";
    $("#countdown").innerHTML =
      '<div class="cd-unit' + late + '"><b>' + Math.floor(m / 1440) + "</b><span>hari</span></div>" +
      '<div class="cd-unit' + late + '"><b>' + pad(Math.floor((m % 1440) / 60)) + "</b><span>jam</span></div>" +
      '<div class="cd-unit' + late + '"><b>' + pad(m % 60) + "</b><span>menit</span></div>";
  }

  $("#nextBtn").addEventListener("click", (e) => {
    if (isPlaceholder(e.currentTarget.dataset.form)) {
      e.preventDefault();
      alert("Link Google Form belum diisi. Guru perlu mengganti formUrl di data.js.");
    }
  });

  /* ---------- Materi ---------- */
  function renderMateri() {
    const q = state.q.trim().toLowerCase();
    const rows = MATERI
      .filter(inScope)
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

    const empty = $("#matEmpty");
    empty.hidden = rows.length > 0;
    if (rows.length === 0) {
      empty.textContent = q
        ? "Tidak ada materi yang cocok dengan “" + state.q.trim() + "”. Coba kata kunci lain atau pilih Semua topik."
        : "Materi untuk pilihan ini belum diunggah. Cek lagi nanti atau pilih topik lain.";
    }
    $("#materiRingkas").textContent = rows.length ? rows.length + " materi" : "";
  }

  /* ---------- Langkah ---------- */
  function renderSteps() {
    $("#steps").innerHTML = LANGKAH.map((s) => "<li>" + esc(s) + "</li>").join("");
  }

  /* ---------- Mulai ---------- */
  function refreshAll() {
    fillKelas();
    renderTabs();
    renderSeg();
    renderChips();
    renderTasks();
    renderMateri();
    renderNext();
  }

  fillIdentity();
  renderSteps();
  refreshAll();
  setInterval(tick, 30000);
})();
