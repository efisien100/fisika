/* Pilihan tema. Dimuat di <head> supaya tema terpasang sebelum halaman tampil. */
(function () {
  "use strict";

  var THEMES = [
    { id: "buku",   nama: "Buku Tulis",  warna: ["#f3f7ff", "#2434d6", "#ffe45c"], font: "" },
    { id: "malam",  nama: "Malam",       warna: ["#14122b", "#b4a8ff", "#ffb547"], font: "Sora:wght@500;700;800" },
    { id: "papan",  nama: "Papan Tulis", warna: ["#1e3a34", "#f6e27a", "#ff9eb5"], font: "Kalam:wght@400;700" },
    { id: "permen", nama: "Permen",      warna: ["#fff0f7", "#6b3fe0", "#ffd43b"], font: "Fredoka:wght@500;600;700" },
    { id: "laut",   nama: "Laut",        warna: ["#e8f7f5", "#0a6c8a", "#ffd166"], font: "Outfit:wght@500;700;800" }
  ];
  var KEY = "kelas-tema-v1";
  var bawaan = "buku";
  var aktif = "buku";

  function byId(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i]; return null; }
  function simpanan() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }

  function muatFont(t) {
    if (!t || !t.font) return;
    var id = "font-" + t.id;
    if (document.getElementById(id)) return;
    var l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + t.font + "&display=swap";
    document.head.appendChild(l);
  }

  function tandai() {
    var btns = document.querySelectorAll(".theme-opt");
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute("aria-pressed", String(btns[i].getAttribute("data-id") === aktif));
    var sw = document.querySelector(".theme summary .sw");
    var t = byId(aktif);
    if (sw && t) sw.innerHTML = "<i style=\"background:" + t.warna[0] + "\"></i><i style=\"background:" + t.warna[1] + "\"></i><i style=\"background:" + t.warna[2] + "\"></i>";
  }

  function apply(id) {
    var t = byId(id) || byId("buku");
    aktif = t.id;
    document.documentElement.setAttribute("data-theme", t.id);
    muatFont(t);
    tandai();
  }

  function pilih(id) {
    if (!byId(id)) return;
    try { localStorage.setItem(KEY, id); } catch (e) { /* abaikan */ }
    apply(id);
  }

  // Tema bawaan dari guru; dipakai jika siswa belum memilih sendiri
  function setDefault(id) {
    bawaan = byId(id) ? id : "buku";
    if (!byId(simpanan())) apply(bawaan);
  }

  function mount() {
    var host = document.getElementById("themePicker");
    if (!host) return;
    var t = byId(aktif);
    host.innerHTML =
      "<summary aria-label=\"Pilih tema tampilan\"><span class=\"sw\"></span>Tema</summary>" +
      "<div class=\"theme-menu\" role=\"group\" aria-label=\"Pilihan tema\">" +
        "<p class=\"theme-title\">Pilih tampilan yang nyaman buatmu</p>" +
        THEMES.map(function (x) {
          return "<button type=\"button\" class=\"theme-opt\" data-id=\"" + x.id + "\" aria-pressed=\"false\">" +
            "<span class=\"sw\"><i style=\"background:" + x.warna[0] + "\"></i><i style=\"background:" + x.warna[1] + "\"></i><i style=\"background:" + x.warna[2] + "\"></i></span>" +
            x.nama + "<span class=\"chk\" aria-hidden=\"true\">✓</span></button>";
        }).join("") +
      "</div>";
    host.addEventListener("click", function (e) {
      var b = e.target.closest(".theme-opt");
      if (!b) return;
      pilih(b.getAttribute("data-id"));
      host.removeAttribute("open");
      var s = host.querySelector("summary"); if (s) s.focus();
    });
    document.addEventListener("click", function (e) { if (host.open && !host.contains(e.target)) host.removeAttribute("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && host.open) { host.removeAttribute("open"); var s = host.querySelector("summary"); if (s) s.focus(); }
    });
    tandai();
  }

  apply(byId(simpanan()) ? simpanan() : bawaan);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();

  window.Tema = { list: THEMES, apply: apply, pilih: pilih, setDefault: setDefault, current: function () { return aktif; } };
})();
