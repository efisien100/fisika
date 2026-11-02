(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) =>
    String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const LS_REPO = "admin-repo-v1";
  const KEY_TOKEN = "admin-token-v1";
  const JENIS = ["PDF", "Slide", "Video", "Link"];
  const MAX_UPLOAD = 25 * 1024 * 1024;

  let data = null;   // isi data.json
  let sha = null;    // versi file di GitHub (untuk mencegah tabrakan)
  let conn = null;   // { owner, repo, branch, token } atau null (mode lokal)
  let dirty = false;
  const view = { tab: "tugas", kelas: "Semua", semester: "Semua" };

  /* ---------- Util ---------- */
  let toastTimer;
  function toast(msg, kind) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast " + (kind || "");
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, kind === "err" ? 9000 : 4000);
  }

  function fromB64(b) {
    const bin = atob(String(b).replace(/\s/g, ""));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function toB64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function fileToB64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || "");
      r.onerror = () => reject(new Error("File tidak bisa dibaca."));
      r.readAsDataURL(file);
    });
  }
  const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "item";
  const zona = () => (data && data.situs && data.situs.zona) || "+08:00";
  const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

  function normalize(d) {
    d = d || {};
    d.situs = d.situs || {};
    d.kurikulum = d.kurikulum || {};
    Object.keys(d.kurikulum).forEach((k) => {
      d.kurikulum[k] = d.kurikulum[k] || {};
      ["1", "2"].forEach((s) => { d.kurikulum[k][s] = d.kurikulum[k][s] || []; });
    });
    d.tugas = d.tugas || [];
    d.materi = d.materi || [];
    d.langkah = d.langkah || [];
    return d;
  }
  const kelasList = () => Object.keys(data.kurikulum);
  const topikOf = (k, s) => (data.kurikulum[k] && data.kurikulum[k][s]) || [];

  /* ---------- GitHub API ---------- */
  async function gh(path, opts) {
    opts = opts || {};
    const r = await fetch("https://api.github.com" + path, {
      method: opts.method || "GET",
      body: opts.body,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + conn.token,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!r.ok) {
      let msg = "HTTP " + r.status;
      try { const j = await r.json(); if (j && j.message) msg = j.message; } catch (e) { /* abaikan */ }
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }
    return r.json();
  }
  const apiPath = (p) => "/repos/" + conn.owner + "/" + conn.repo + "/contents/" + p.split("/").map(encodeURIComponent).join("/");

  function explain(err) {
    if (err.status === 401) return "Token ditolak. Periksa apakah token sudah benar dan belum kedaluwarsa.";
    if (err.status === 403) return "Token tidak punya izin. Pada pengaturan token, ubah Contents menjadi Read and write untuk repository ini.";
    if (err.status === 404) return "Repository atau file data.json tidak ditemukan. Periksa nama repository dan branch, pastikan token punya akses ke repository itu, dan data.json sudah ada di repository.";
    if (err.status === 409 || err.status === 422) return "Data di GitHub berubah sejak kamu membuka halaman ini. Salin perubahanmu (Unduh data.json), muat ulang halaman, lalu ulangi.";
    if (err instanceof TypeError) return "Tidak bisa terhubung ke GitHub. Periksa koneksi internetmu.";
    return err.message || "Terjadi kesalahan.";
  }

  async function connect(c, remember) {
    conn = c;
    try {
      const j = await gh(apiPath("data.json") + "?ref=" + encodeURIComponent(c.branch));
      sha = j.sha;
      data = normalize(JSON.parse(fromB64(j.content)));
    } catch (e) {
      conn = null;
      throw e;
    }
    try {
      localStorage.setItem(LS_REPO, JSON.stringify({ repo: c.owner + "/" + c.repo, branch: c.branch }));
      sessionStorage.removeItem(KEY_TOKEN);
      localStorage.removeItem(KEY_TOKEN);
      (remember ? localStorage : sessionStorage).setItem(KEY_TOKEN, c.token);
    } catch (e) { /* abaikan */ }
    dirty = false;
    showApp();
  }

  async function save() {
    if (!conn) return;
    const btn = $("#saveBtn");
    btn.disabled = true;
    btn.textContent = "Menyimpan…";
    try {
      const body = {
        message: "Perbarui konten lewat halaman admin",
        content: toB64(JSON.stringify(data, null, 2) + "\n"),
        sha: sha,
        branch: conn.branch,
      };
      const j = await gh(apiPath("data.json"), { method: "PUT", body: JSON.stringify(body) });
      sha = j.content.sha;
      dirty = false;
      toast("Tersimpan. Perubahan tampil di situs dalam 1 sampai 3 menit.", "ok");
    } catch (e) {
      toast(explain(e), "err");
    } finally {
      btn.textContent = "Simpan ke GitHub";
      renderBar();
    }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function uploadFile(file) {
    if (!conn) throw new Error("Unggah file hanya tersedia setelah masuk dengan GitHub.");
    if (file.size > MAX_UPLOAD) throw new Error("Ukuran file maksimal 25 MB. Untuk file lebih besar, pakai link Google Drive atau YouTube.");
    const m = file.name.match(/^(.*?)(\.[^.]+)?$/);
    const base = slug(m[1]);
    const ext = (m[2] || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
    let name = base + ext;
    try {
      await gh(apiPath("materi/" + name) + "?ref=" + encodeURIComponent(conn.branch));
      name = base + "-" + Date.now().toString(36) + ext; // nama sudah dipakai
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    const content = await fileToB64(file);
    await gh(apiPath("materi/" + name), {
      method: "PUT",
      body: JSON.stringify({ message: "Unggah materi " + name, content: content, branch: conn.branch }),
    });
    return "materi/" + name;
  }

  /* ---------- Masuk ---------- */
  function showLoginError(msg) {
    const e = $("#loginError");
    e.textContent = msg;
    e.hidden = !msg;
  }
  function setBusy(b) {
    $("#loginBtn").disabled = b;
    $("#loginBtn").textContent = b ? "Memeriksa…" : "Masuk";
  }

  function prefill() {
    let repo = "", branch = "main";
    try {
      const s = JSON.parse(localStorage.getItem(LS_REPO) || "null");
      if (s) { repo = s.repo || ""; branch = s.branch || "main"; }
    } catch (e) { /* abaikan */ }
    if (!repo && /\.github\.io$/.test(location.hostname)) {
      const owner = location.hostname.split(".")[0];
      const first = location.pathname.split("/").filter(Boolean)[0];
      repo = owner + "/" + (first && !/\.html$/.test(first) ? first : owner + ".github.io");
    }
    $("#inRepo").value = repo;
    $("#inBranch").value = branch;
  }

  function storedToken() {
    try { return sessionStorage.getItem(KEY_TOKEN) || localStorage.getItem(KEY_TOKEN) || ""; } catch (e) { return ""; }
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoginError("");
    const parts = $("#inRepo").value.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/, "").split("/").filter(Boolean);
    if (parts.length !== 2) { showLoginError("Isi repository dengan format pemilik/nama-repository."); return; }
    setBusy(true);
    try {
      await connect(
        { owner: parts[0], repo: parts[1], branch: $("#inBranch").value.trim() || "main", token: $("#inToken").value.trim() },
        $("#inRemember").checked
      );
      $("#inToken").value = "";
    } catch (err) {
      showLoginError(explain(err));
    } finally {
      setBusy(false);
    }
  });

  $("#localBtn").addEventListener("click", async () => {
    showLoginError("");
    try {
      const r = await fetch("data.json?" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error("data.json tidak ditemukan di situs ini.");
      data = normalize(await r.json());
      conn = null; sha = null; dirty = false;
      showApp();
    } catch (err) {
      showLoginError(err.message);
    }
  });

  $("#logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (dirty && !confirm("Ada perubahan yang belum disimpan. Tetap keluar?")) return;
    try { sessionStorage.removeItem(KEY_TOKEN); localStorage.removeItem(KEY_TOKEN); } catch (er) { /* abaikan */ }
    conn = null; data = null; dirty = false;
    $("#app").hidden = true;
    $("#login").hidden = false;
    $("#logoutBtn").hidden = true;
  });

  window.addEventListener("beforeunload", (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------- Kerangka admin ---------- */
  function showApp() {
    $("#login").hidden = true;
    $("#app").hidden = false;
    $("#logoutBtn").hidden = false;
    $("#fKelas").innerHTML = '<option value="Semua">Semua</option>' + kelasList().map((k) => '<option value="' + esc(k) + '">Kelas ' + esc(k) + "</option>").join("");
    view.kelas = "Semua"; view.semester = "Semua";
    $("#fKelas").value = "Semua"; $("#fSemester").value = "Semua";
    renderAll();
  }

  function markDirty() { dirty = true; renderBar(); }

  function renderBar() {
    const bar = $("#savebar");
    bar.classList.toggle("clean", !dirty);
    $("#saveState").textContent = dirty
      ? "Ada perubahan yang belum disimpan"
      : (conn ? "Semua perubahan tersimpan di GitHub" : "Mode lokal: belum ada perubahan");
    const sb = $("#saveBtn");
    sb.hidden = !conn;
    sb.disabled = !dirty;
    $("#downloadBtn").textContent = conn ? "Unduh data.json" : "Unduh data.json untuk diunggah";
  }

  function renderAll() {
    renderBar();
    renderTugas();
    renderMateri();
    renderTopik();
    renderSitus();
    showTab(view.tab);
  }

  function showTab(t) {
    view.tab = t;
    $$("#adminTabs .tab").forEach((b) => {
      const on = b.dataset.tab === t;
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
    });
    ["tugas", "materi", "topik", "situs"].forEach((n) => { $("#pane-" + n).hidden = n !== t; });
    $("#filterbar").hidden = !(t === "tugas" || t === "materi");
  }

  $("#adminTabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (b) showTab(b.dataset.tab);
  });
  $("#adminTabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const order = ["tugas", "materi", "topik", "situs"];
    const i = order.indexOf(view.tab);
    const n = order[(i + (e.key === "ArrowRight" ? 1 : -1) + order.length) % order.length];
    showTab(n);
    const el = $('#adminTabs [data-tab="' + n + '"]'); if (el) el.focus();
  });

  $("#fKelas").addEventListener("change", (e) => { view.kelas = e.target.value; renderTugas(); renderMateri(); });
  $("#fSemester").addEventListener("change", (e) => { view.semester = e.target.value; renderTugas(); renderMateri(); });
  $("#saveBtn").addEventListener("click", save);
  $("#downloadBtn").addEventListener("click", downloadJson);

  const match = (x) =>
    (view.kelas === "Semua" || x.kelas === view.kelas) &&
    (view.semester === "Semua" || String(x.semester) === String(view.semester));

  /* ---------- Daftar tugas ---------- */
  function renderTugas() {
    const rows = data.tugas.map((t, i) => ({ t, i })).filter((r) => match(r.t))
      .sort((a, b) => new Date(a.t.deadline) - new Date(b.t.deadline));
    $("#listTugas").innerHTML = rows.map(({ t, i }) => {
      const d = new Date(t.deadline);
      const late = d < new Date();
      const noForm = !/^https?:\/\//.test(t.formUrl || "") || /GANTI/i.test(t.formUrl);
      return (
        '<li class="item' + (noForm ? " warn" : "") + '">' +
          '<div class="item-main">' +
            '<p class="item-title">' + esc(t.judul) + "</p>" +
            '<div class="item-meta"><span>Kelas ' + esc(t.kelas) + " · Smt " + esc(t.semester) + "</span><span>" + esc(t.topik) + "</span>" +
            "<span>" + (isNaN(d) ? "Tenggat belum valid" : (late ? "Berakhir " : "Tenggat ") + d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear()) + "</span>" +
            (noForm ? "<span>Link Google Form belum diisi</span>" : "") + "</div>" +
          "</div>" +
          '<div class="item-actions">' +
            '<button class="btn btn-ghost btn-sm" type="button" data-act="edit" data-i="' + i + '">Ubah</button>' +
            '<button class="btn btn-danger btn-sm" type="button" data-act="del" data-i="' + i + '">Hapus</button>' +
          "</div>" +
        "</li>"
      );
    }).join("");
    $("#emptyTugas").hidden = rows.length > 0;
  }

  /* ---------- Daftar materi ---------- */
  function renderMateri() {
    const rows = data.materi.map((m, i) => ({ m, i })).filter((r) => match(r.m))
      .sort((a, b) => (a.m.tanggal < b.m.tanggal ? 1 : -1));
    $("#listMateri").innerHTML = rows.map(({ m, i }) => {
      const noUrl = !m.url || m.url === "#";
      return (
        '<li class="item' + (noUrl ? " warn" : "") + '">' +
          '<div class="item-main">' +
            '<p class="item-title">' + esc(m.judul) + "</p>" +
            '<div class="item-meta"><span>Kelas ' + esc(m.kelas) + " · Smt " + esc(m.semester) + "</span><span>" + esc(m.topik) + "</span><span>" + esc(m.jenis) + "</span>" +
            (noUrl ? "<span>Link atau file belum diisi</span>" : "") + "</div>" +
          "</div>" +
          '<div class="item-actions">' +
            '<button class="btn btn-ghost btn-sm" type="button" data-act="edit" data-i="' + i + '">Ubah</button>' +
            '<button class="btn btn-danger btn-sm" type="button" data-act="del" data-i="' + i + '">Hapus</button>' +
          "</div>" +
        "</li>"
      );
    }).join("");
    $("#emptyMateri").hidden = rows.length > 0;
  }

  $("#listTugas").addEventListener("click", (e) => listAction(e, "tugas"));
  $("#listMateri").addEventListener("click", (e) => listAction(e, "materi"));
  $("#addTugas").addEventListener("click", () => openForm("tugas", null));
  $("#addMateri").addEventListener("click", () => openForm("materi", null));

  function listAction(e, type) {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const i = Number(b.dataset.i);
    if (b.dataset.act === "edit") { openForm(type, i); return; }
    const item = data[type][i];
    if (confirm('Hapus "' + item.judul + '"? Perubahan baru tersimpan setelah kamu klik Simpan.')) {
      data[type].splice(i, 1);
      markDirty();
      type === "tugas" ? renderTugas() : renderMateri();
      renderTopik();
    }
  }

  /* ---------- Form tambah / ubah ---------- */
  function opt(val, label, sel) { return '<option value="' + esc(val) + '"' + (String(val) === String(sel) ? " selected" : "") + ">" + esc(label) + "</option>"; }

  function openForm(type, idx) {
    if (kelasList().length === 0) { toast("Belum ada kelas di daftar topik.", "err"); return; }
    const isT = type === "tugas";
    const item = idx == null ? null : data[type][idx];
    const k0 = item ? item.kelas : (view.kelas !== "Semua" ? view.kelas : kelasList()[0]);
    const s0 = item ? Number(item.semester) : (view.semester !== "Semua" ? Number(view.semester) : 1);
    const dlg = $("#dlg");

    dlg.innerHTML =
      '<form class="dlg-form" id="frm" novalidate>' +
        '<h2 id="dlgTitle">' + (item ? "Ubah " : "Tambah ") + (isT ? "tugas" : "materi") + "</h2>" +
        '<div class="row2">' +
          '<div class="field"><label for="f-kelas">Kelas</label><select id="f-kelas">' + kelasList().map((k) => opt(k, "Kelas " + k, k0)).join("") + "</select></div>" +
          '<div class="field"><label for="f-smt">Semester</label><select id="f-smt">' + opt(1, "Semester 1", s0) + opt(2, "Semester 2", s0) + "</select></div>" +
        "</div>" +
        '<div class="field"><label for="f-topik">Topik</label><select id="f-topik"></select></div>' +
        '<div class="field"><label for="f-judul">Judul</label><input id="f-judul" required value="' + esc(item ? item.judul : "") + '"></div>' +
        '<div class="field"><label for="f-desk">Deskripsi</label><textarea id="f-desk" rows="3">' + esc(item ? item.deskripsi : "") + "</textarea></div>" +
        (isT
          ? '<div class="row2">' +
              '<div class="field"><label for="f-deadline">Tenggat</label><input id="f-deadline" type="datetime-local" required value="' + esc(item ? String(item.deadline).slice(0, 16) : "") + '"><small>Zona waktu mengikuti Pengaturan (' + esc(zona()) + ").</small></div>" +
            "</div>" +
            '<div class="field"><label for="f-url">Link Google Form</label><input id="f-url" type="url" required placeholder="https://forms.gle/..." value="' + esc(item && !/GANTI/i.test(item.formUrl) ? item.formUrl : "") + '"></div>'
          : '<div class="row2">' +
              '<div class="field"><label for="f-jenis">Jenis</label><select id="f-jenis">' + JENIS.map((j) => opt(j, j, item ? item.jenis : "PDF")).join("") + "</select></div>" +
              '<div class="field"><label for="f-tgl">Tanggal</label><input id="f-tgl" type="date" required value="' + esc(item ? item.tanggal : todayStr()) + '"></div>' +
            "</div>" +
            '<div class="field"><label for="f-url">Link atau file</label>' +
              '<div class="url-row"><input id="f-url" required placeholder="https://drive.google.com/... atau materi/nama-file.pdf" value="' + esc(item && item.url !== "#" ? item.url : "") + '">' +
              (conn ? '<button class="btn btn-ghost btn-sm" type="button" id="upBtn">Unggah file</button><input type="file" id="upFile" hidden>' : "") + "</div>" +
              "<small>" + (conn ? "Tempel link Google Drive atau YouTube, atau unggah file (maksimal 25 MB) ke repository." : "Tempel link Google Drive atau YouTube. Unggah file tersedia setelah masuk dengan GitHub.") + "</small></div>"
        ) +
        '<p class="form-error" id="frmErr" role="alert" hidden></p>' +
        '<div class="dlg-actions"><button class="btn btn-ghost" type="button" id="cancelBtn">Batal</button><button class="btn btn-primary" type="submit">' + (item ? "Simpan perubahan" : "Tambahkan") + "</button></div>" +
      "</form>";

    const fillTopik = (sel) => {
      const k = $("#f-kelas").value, s = $("#f-smt").value;
      const list = topikOf(k, s);
      $("#f-topik").innerHTML = list.length
        ? list.map((t) => opt(t, t, sel)).join("")
        : '<option value="">Belum ada topik. Tambahkan dulu di tab Topik.</option>';
    };
    fillTopik(item ? item.topik : "");
    $("#f-kelas").addEventListener("change", () => fillTopik(""));
    $("#f-smt").addEventListener("change", () => fillTopik(""));
    $("#cancelBtn").addEventListener("click", () => dlg.close());

    const upBtn = $("#upBtn");
    if (upBtn) {
      upBtn.addEventListener("click", () => $("#upFile").click());
      $("#upFile").addEventListener("change", async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        upBtn.disabled = true; upBtn.textContent = "Mengunggah…";
        try {
          $("#f-url").value = await uploadFile(f);
          const ext = (f.name.split(".").pop() || "").toLowerCase();
          if (ext === "pdf") $("#f-jenis").value = "PDF";
          else if (["ppt", "pptx", "key"].includes(ext)) $("#f-jenis").value = "Slide";
          else if (["mp4", "mov", "webm"].includes(ext)) $("#f-jenis").value = "Video";
          toast("File terunggah. Tampil di situs setelah 1 sampai 3 menit.", "ok");
        } catch (err) {
          const m = $("#frmErr"); m.textContent = explain(err); m.hidden = false;
        } finally {
          upBtn.disabled = false; upBtn.textContent = "Unggah file";
        }
      });
    }

    $("#frm").addEventListener("submit", (e) => {
      e.preventDefault();
      const err = (msg) => { const m = $("#frmErr"); m.textContent = msg; m.hidden = false; };
      const v = (id) => $(id).value.trim();
      if (!v("#f-topik")) return err("Pilih topik. Jika daftar kosong, tambahkan topik di tab Topik.");
      if (!v("#f-judul")) return err("Judul wajib diisi.");
      let obj = { kelas: v("#f-kelas"), semester: Number(v("#f-smt")), topik: v("#f-topik"), judul: v("#f-judul"), deskripsi: v("#f-desk") };

      if (isT) {
        if (!v("#f-deadline")) return err("Tenggat wajib diisi.");
        if (!/^https?:\/\//i.test(v("#f-url"))) return err("Link Google Form harus diawali https://");
        obj.deadline = v("#f-deadline").slice(0, 16) + ":00" + zona();
        obj.formUrl = v("#f-url");
        obj.id = item ? item.id : uniqueId(obj.kelas + "-" + obj.judul);
      } else {
        if (!v("#f-url")) return err("Isi link atau unggah file.");
        if (!/^https?:\/\//i.test(v("#f-url")) && !/^materi\//.test(v("#f-url"))) return err("Link harus diawali https:// atau berupa path file di folder materi/.");
        obj.jenis = v("#f-jenis");
        obj.tanggal = v("#f-tgl");
        obj.url = v("#f-url");
      }

      if (item) Object.assign(item, obj); else data[type].push(obj);
      markDirty();
      renderTugas(); renderMateri(); renderTopik();
      dlg.close();
      toast((item ? "Perubahan" : (isT ? "Tugas" : "Materi")) + " ditambahkan ke daftar. Klik Simpan ke GitHub untuk menerbitkan.", "ok");
    });

    dlg.showModal();
    $("#f-judul").focus();
  }

  function uniqueId(base) {
    const root = slug(base);
    let id = root, n = 2;
    const used = new Set(data.tugas.map((t) => t.id));
    while (used.has(id)) { id = root + "-" + n++; }
    return id;
  }

  /* ---------- Topik ---------- */
  function usage(k, s, name) {
    const f = (x) => x.kelas === k && Number(x.semester) === Number(s) && x.topik === name;
    return data.tugas.filter(f).length + data.materi.filter(f).length;
  }

  function renderTopik() {
    $("#topikWrap").innerHTML = kelasList().map((k) =>
      [1, 2].map((s) => {
        const list = topikOf(k, s);
        return (
          '<div class="topik-card"><h3>Kelas ' + esc(k) + " · Semester " + s + "</h3>" +
          '<ul class="topik-list">' +
          (list.length ? list.map((t, i) =>
            '<li class="topik-row"><span class="topik-name">' + esc(t) + ' <small>(' + usage(k, s, t) + " isi)</small></span>" +
            '<span class="item-actions" data-k="' + esc(k) + '" data-s="' + s + '" data-i="' + i + '">' +
              '<button class="icon-btn" type="button" data-act="up" aria-label="Naikkan ' + esc(t) + '"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
              '<button class="icon-btn" type="button" data-act="down" aria-label="Turunkan ' + esc(t) + '"' + (i === list.length - 1 ? " disabled" : "") + ">↓</button>" +
              '<button class="btn btn-ghost btn-sm" type="button" data-act="rename">Ubah nama</button>' +
              '<button class="btn btn-danger btn-sm" type="button" data-act="remove">Hapus</button>' +
            "</span></li>"
          ).join("") : '<li class="pane-note">Belum ada topik.</li>') +
          "</ul>" +
          '<div class="topik-add" data-k="' + esc(k) + '" data-s="' + s + '">' +
            '<input type="text" aria-label="Topik baru untuk kelas ' + esc(k) + " semester " + s + '" placeholder="Nama topik baru">' +
            '<button class="btn btn-primary btn-sm" type="button" data-act="add">Tambah topik</button></div></div>'
        );
      }).join("")
    ).join("");
  }

  $("#topikWrap").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const host = b.closest("[data-k]");
    const k = host.dataset.k, s = Number(host.dataset.s);
    const list = data.kurikulum[k][s];
    const act = b.dataset.act;

    if (act === "add") {
      const inp = $("input", host);
      const name = inp.value.trim();
      if (!name) { toast("Isi nama topik dulu.", "err"); inp.focus(); return; }
      if (list.includes(name)) { toast("Topik itu sudah ada di semester ini.", "err"); return; }
      list.push(name);
    } else {
      const i = Number(host.dataset.i);
      const name = list[i];
      if (act === "up" && i > 0) { list.splice(i - 1, 0, list.splice(i, 1)[0]); }
      else if (act === "down" && i < list.length - 1) { list.splice(i + 1, 0, list.splice(i, 1)[0]); }
      else if (act === "rename") {
        const nn = (prompt("Nama baru untuk topik ini:", name) || "").trim();
        if (!nn || nn === name) return;
        if (list.includes(nn)) { toast("Topik dengan nama itu sudah ada.", "err"); return; }
        list[i] = nn;
        data.tugas.concat(data.materi).forEach((x) => { if (x.kelas === k && Number(x.semester) === s && x.topik === name) x.topik = nn; });
      } else if (act === "remove") {
        const n = usage(k, s, name);
        if (n > 0) { toast('Topik "' + name + '" masih dipakai ' + n + " tugas atau materi. Pindahkan atau hapus dulu isinya.", "err"); return; }
        if (!confirm('Hapus topik "' + name + '"?')) return;
        list.splice(i, 1);
      }
    }
    markDirty();
    renderTopik();
    renderTugas(); renderMateri();
  });

  $("#topikWrap").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".topik-add input")) {
      e.preventDefault();
      $('button[data-act="add"]', e.target.closest(".topik-add")).click();
    }
  });

  /* ---------- Pengaturan ---------- */
  function renderSitus() {
    $$("[data-situs]").forEach((el) => { el.value = data.situs[el.dataset.situs] || (el.dataset.situs === "zona" ? "+08:00" : ""); });
    $("#sLangkah").value = (data.langkah || []).join("\n");
  }
  $$("[data-situs]").forEach((el) => {
    el.addEventListener("input", () => { data.situs[el.dataset.situs] = el.value; markDirty(); });
  });
  $("#sLangkah").addEventListener("input", (e) => {
    data.langkah = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
    markDirty();
  });

  /* ---------- Mulai ---------- */
  prefill();
  const tok = storedToken();
  const saved = (function () { try { return JSON.parse(localStorage.getItem(LS_REPO) || "null"); } catch (e) { return null; } })();
  if (tok && saved && saved.repo && saved.repo.split("/").length === 2) {
    const p = saved.repo.split("/");
    $("#inRepo").value = saved.repo;
    setBusy(true);
    connect({ owner: p[0], repo: p[1], branch: saved.branch || "main", token: tok }, !!localStorage.getItem(KEY_TOKEN))
      .catch((err) => showLoginError(explain(err)))
      .finally(() => setBusy(false));
  }
})();
