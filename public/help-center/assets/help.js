/* Raap Nexus help portal: language (screenshots, button names, portal text), search, contents list, picture zoom, dark mode. Plain JavaScript, no libraries, works offline and from a folder. */
(function () {
  "use strict";
  var LANGS = [["en", "English"], ["ar", "العربية"], ["ur", "اردو"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["it", "Italiano"], ["pt-BR", "Português (Brasil)"], ["ru", "Русский"], ["tr", "Türkçe"],
    ["hi", "हिन्दी"], ["te", "తెలుగు"], ["ta", "தமிழ்"], ["ml", "മലയാളം"], ["id", "Bahasa Indonesia"], ["zh-CN", "简体中文"], ["ja", "日本語"], ["ko", "한국어"]];
  var RTL = { ar: 1, ur: 1 };
  var D = window.HELP_DATA || { chrome: { en: {} }, ui: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function pickLang() {
    var q = (location.search.match(/[?&]lang=([\w-]+)/) || [])[1];
    var want = q || store("help-lang") || (navigator.language || "en");
    var hit = LANGS.filter(function (l) { return l[0].toLowerCase() === want.toLowerCase(); })[0];
    if (!hit) { var base = want.split("-")[0].toLowerCase(); hit = LANGS.filter(function (l) { return l[0].split("-")[0].toLowerCase() === base; })[0]; }
    return hit ? hit[0] : "en";
  }
  var lang = pickLang();
  function T(key, vars) {
    var s = (D.chrome[lang] || {})[key] || (D.chrome.en || {})[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function theme(v) {
    if (v) { store("help-theme", v); }
    var t = v || store("help-theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
    else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme", "dark");
  }
  theme();

  // article text in the chosen language: assets/t/<lang>.js holds it (loaded on demand); a text with no translation stays English
  function TR(id, f) { var t = (window.HELP_T || {})[lang]; return t && t[id] && t[id][f]; }
  function loadText(cb) {
    if (lang === "en" || (window.HELP_T || {})[lang]) return cb();
    var sc = document.createElement("script"); sc.src = "assets/t/" + lang + ".js"; sc.onload = sc.onerror = cb; document.head.appendChild(sc);
  }
  function applyText() {
    $$("[data-tx]").forEach(function (n) {
      if (n.getAttribute("data-en") === null) n.setAttribute("data-en", n.innerHTML);
      var k = n.getAttribute("data-tx").split("|");
      n.innerHTML = TR(k[0], k[1]) || n.getAttribute("data-en");
    });
    var id = document.body.getAttribute("data-page"), t = TR(id, "t");
    if (id && id !== "home") { var h = $("article h1"); document.title = (t ? h.textContent : (h ? h.getAttribute("data-en") : "")) + " · Raap Nexus Help"; }
    buildToc();
  }
  function buildToc() {
    var toc = $("#toc"); if (!toc) return;
    toc.innerHTML = "";
    var hs = $$("article h2");
    hs.forEach(function (h, i) { if (!h.id) h.id = "s" + (i + 1); var a = document.createElement("a"); a.href = "#" + h.id; a.textContent = h.textContent; toc.appendChild(a); });
    toc.parentNode.style.display = hs.length ? "" : "none";
    if (io) io.disconnect();
    if ("IntersectionObserver" in window && hs.length) {
      var links = $$("a", toc);
      io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id); }); }); }, { rootMargin: "-80px 0px -70% 0px" });
      hs.forEach(function (h) { io.observe(h); });
    }
  }
  var io = null;

  function apply() {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL[lang] ? "rtl" : "ltr";
    $$("[data-t]").forEach(function (n) { n.textContent = T(n.getAttribute("data-t"), { v: window.HELP_VERSION || "" }); });
    $$("[data-tp]").forEach(function (n) { n.setAttribute("placeholder", T(n.getAttribute("data-tp"))); });
    $$("[data-tt]").forEach(function (n) { var s = T(n.getAttribute("data-tt")); n.setAttribute("title", s); n.setAttribute("aria-label", s); });
    var ui = D.ui[lang] || {};
    $$(".ui").forEach(function (n) { var k = n.getAttribute("data-ui") || n.textContent; n.setAttribute("data-ui", k); n.textContent = ui[k] || k; });
    $$("img[data-shot]").forEach(function (im) {
      var name = im.getAttribute("data-shot");
      im.onerror = function () { im.onerror = null; im.src = "shots/en/" + name + ".webp"; };
      im.src = "shots/" + lang + "/" + name + ".webp";
    });
    var sel = $("#lang"); if (sel) sel.value = lang;
    var want = lang;
    loadText(function () { if (want === lang) { applyText(); applyUi(); } });
  }
  function applyUi() {            // button names and pictures sit inside the translated text too
    var ui = D.ui[lang] || {};
    $$(".ui").forEach(function (n) { var k = n.getAttribute("data-ui") || n.textContent; n.setAttribute("data-ui", k); n.textContent = ui[k] || k; });
    $$("img[data-shot]").forEach(function (im) {
      var name = im.getAttribute("data-shot");
      im.onerror = function () { im.onerror = null; im.src = "shots/en/" + name + ".webp"; };
      im.src = "shots/" + lang + "/" + name + ".webp";
    });
    $$("[data-t]").forEach(function (n) { n.textContent = T(n.getAttribute("data-t"), { v: window.HELP_VERSION || "" }); });
  }

  function build() {
    var sel = $("#lang");
    if (sel) {
      LANGS.forEach(function (l) { var o = document.createElement("option"); o.value = l[0]; o.textContent = l[1]; sel.appendChild(o); });
      sel.addEventListener("change", function () { lang = sel.value; store("help-lang", lang); apply(); });
    }
    var tb = $("#theme"); if (tb) tb.addEventListener("click", function () { theme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); });
    var mb = $(".menu"); if (mb) mb.addEventListener("click", function () { document.body.classList.toggle("nav"); });
    $$(".side a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav"); }); });

    // picture zoom
    var lb = document.createElement("div"); lb.className = "lb"; lb.innerHTML = '<img alt=""><button type="button" data-t="close"></button>'; document.body.appendChild(lb);
    function closeLb() { lb.classList.remove("on"); }
    lb.addEventListener("click", closeLb);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeLb(); var r = $(".results"); if (r) r.classList.remove("on"); } });
    document.addEventListener("click", function (e) { var im = e.target; if (im.tagName === "IMG" && im.closest && im.closest("figure:not(.gif)")) { $("img", lb).src = im.src; $("img", lb).alt = im.alt; lb.classList.add("on"); } });

    // search
    $$(".search").forEach(function (box) {
      var input = $("input", box), out = $(".results", box), sel = -1, hits = [];
      function run() {
        var q = input.value.trim().toLowerCase();
        if (q.length < 2) { out.classList.remove("on"); return; }
        var words = q.split(/\s+/);
        hits = (window.HELP_SEARCH || []).map(function (a) {
          var s = 0, ti = TR(a.id, "t") || a.title, su = (TR(a.id, "s") || a.summary).replace(/<[^>]+>/g, ""), t = (ti + " " + a.title).toLowerCase(), m = su.toLowerCase(), x = ((TR(a.id, "x") || "") + " " + a.text).toLowerCase();
          for (var i = 0; i < words.length; i++) {
            var w = words[i], f = 0;
            if (t.indexOf(w) > -1) f += 10; if (m.indexOf(w) > -1) f += 4; if (x.indexOf(w) > -1) f += 1 + Math.min(3, x.split(w).length - 2);
            if (!f) return { a: a, s: 0 };
            s += f;
          }
          return { a: a, s: s };
        }).filter(function (h) { return h.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 8);
        out.innerHTML = hits.length ? hits.map(function (h) { return '<a href="' + h.a.id + '.html"><b>' + h.ti + '</b><small>' + h.su + "</small></a>"; }).join("") : '<div class="none">' + T("noresult") + "</div>";
        out.classList.add("on"); sel = -1;
      }
      input.addEventListener("input", run);
      input.addEventListener("keydown", function (e) {
        var as = $$("a", out);
        if (e.key === "ArrowDown" && as.length) { sel = (sel + 1) % as.length; e.preventDefault(); }
        else if (e.key === "ArrowUp" && as.length) { sel = (sel - 1 + as.length) % as.length; e.preventDefault(); }
        else if (e.key === "Enter" && as.length) { location.href = as[Math.max(sel, 0)].getAttribute("href"); }
        as.forEach(function (a, i) { a.classList.toggle("sel", i === sel); });
      });
      document.addEventListener("click", function (e) { if (!box.contains(e.target)) out.classList.remove("on"); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { var i = $(".top .search input") || $(".search input"); if (i) { e.preventDefault(); i.focus(); } } });

    // "Open Raap Nexus" only when this help is served by the app itself
    var open = $("#openapp");
    if (open && /^https?:/.test(location.protocol)) { fetch("/api/state", { credentials: "same-origin" }).then(function (r) { if (r.ok) open.hidden = false; }).catch(function () { /* the website: no app here */ }); }
    apply();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
