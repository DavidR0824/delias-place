/* Delia's Place — interacciones (IIFE clásico, sin módulos) */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (err) { if (window.console) console.warn("[init] " + name + " falló:", err); }
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("nav");
    if (!toggle || !nav) return;
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    function show(el) { el.classList.add("is-visible"); }
    if (!("IntersectionObserver" in window)) { items.forEach(show); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });

    // Escalonado suave dentro de cada grupo de tarjetas
    document.querySelectorAll(".services-grid, .trust-grid, .why-list, .visit-list, .brands-grid").forEach(function (group) {
      Array.prototype.forEach.call(group.querySelectorAll(".reveal"), function (el, i) {
        el.style.transitionDelay = (i % 4) * 90 + "ms";
      });
    });

    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad: nada queda oculto
    window.setTimeout(function () { items.forEach(show); }, 6000);
  }

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* Greviews_design — carrusel de reseñas */
  function wireReviewsCarousel() {
    var track = document.getElementById("reviewsTrack");
    var prev = document.getElementById("reviewsPrev");
    var next = document.getElementById("reviewsNext");
    if (!track || !prev || !next) return;

    function cardStep() {
      var card = track.querySelector(".review-card");
      return card ? card.getBoundingClientRect().width + 24 : 320;
    }

    function scrollByCard(direction) {
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (direction > 0 && atEnd) {
        track.scrollTo({ left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        return;
      }
      track.scrollBy({ left: cardStep() * direction, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    prev.addEventListener("click", function () { scrollByCard(-1); stopAutoplay(); });
    next.addEventListener("click", function () { scrollByCard(1); stopAutoplay(); });

    var autoplayId = null;
    function startAutoplay() {
      if (prefersReducedMotion || autoplayId) return;
      autoplayId = window.setInterval(function () { scrollByCard(1); }, 4500);
    }
    function stopAutoplay() {
      if (autoplayId) { window.clearInterval(autoplayId); autoplayId = null; }
    }

    ["mouseenter", "focusin", "touchstart"].forEach(function (evt) {
      track.addEventListener(evt, stopAutoplay, { passive: true });
    });
    ["mouseleave", "focusout"].forEach(function (evt) {
      track.addEventListener(evt, startAutoplay, { passive: true });
    });

    startAutoplay();
  }

  function boot() {
    safe(initHeader, "header");
    safe(initNav, "nav");
    safe(initReveal, "reveal");
    safe(initYear, "year");
    safe(wireReviewsCarousel, "reviews");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
