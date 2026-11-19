/* ============================================================
   Shivansh Tripathi — portfolio interactions
   Vanilla JS. No runtime dependencies beyond the hero shader.
   ============================================================ */

(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- 01 · Hero type ---------- */

  $$("[data-split]").forEach(function (line) {
    var text = line.textContent.trim();
    var fragment = document.createDocumentFragment();
    Array.prototype.forEach.call(text, function (character, index) {
      var span = document.createElement("span");
      span.className = "ch";
      span.style.setProperty("--i", String(index));
      span.textContent = character === " " ? "\u00A0" : character;
      fragment.appendChild(span);
    });
    line.textContent = "";
    line.appendChild(fragment);
  });

  /* ---------- 02 · Reveal on scroll ---------- */

  var revealGroups = new Map();
  $$("[data-reveal]").forEach(function (element) {
    var parent = element.parentElement;
    if (!revealGroups.has(parent)) revealGroups.set(parent, []);
    revealGroups.get(parent).push(element);
  });
  revealGroups.forEach(function (children) {
    if (children.length < 2) return;
    children.forEach(function (element, index) {
      element.style.setProperty("--delay", Math.min(index * 0.065, 0.24).toFixed(3) + "s");
    });
  });

  var revealElements = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) { element.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.06 });
    revealElements.forEach(function (element) { revealObserver.observe(element); });
    // Elements already in the first paint should not wait on a scroll event.
    requestAnimationFrame(function () {
      revealElements.forEach(function (element) {
        var rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) element.classList.add("is-in");
      });
    });
  }

  /* ---------- 03 · Counters ---------- */

  $$("[data-count]").forEach(function (counter) {
    var target = parseInt(counter.getAttribute("data-count"), 10);
    if (isNaN(target)) return;

    function finish() {
      counter.textContent = String(target);
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      finish();
      return;
    }

    // The markup ships the real values for no-JS readers; reset only when
    // the animation can actually run.
    counter.textContent = "0";

    var played = false;
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || played) return;
        played = true;
        counterObserver.disconnect();
        var start = performance.now();
        var duration = 1500;
        function tick(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
          else finish();
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.55 });
    counterObserver.observe(counter.closest(".stat") || counter);
  });

  /* ---------- 04 · Scroll state, progress, nav spy ---------- */

  var nav = $("#nav");
  var progressBar = $("#scroll-progress-bar");
  var navLinks = $$("[data-nav]");
  var navSections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);
  var ticking = false;

  function updateScrollUI() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);
    if (progressBar) {
      var ratio = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
    }

    var activeId = "";
    var marker = y + window.innerHeight * 0.34;
    navSections.forEach(function (section) {
      if (section.offsetTop <= marker) activeId = section.id;
    });
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + activeId;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    ticking = false;
  }

  function requestScrollUI() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener("scroll", requestScrollUI, { passive: true });
  window.addEventListener("resize", requestScrollUI);
  updateScrollUI();

  /* ---------- 05 · Clock (IST) ---------- */

  var clockFormat;
  try {
    clockFormat = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  } catch (err) {
    clockFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  var timeNodes = [$("#local-time"), $("#foot-time")].filter(Boolean);
  function updateClock() {
    var value = clockFormat.format(new Date());
    timeNodes.forEach(function (node) { node.textContent = value; });
  }
  updateClock();
  window.setInterval(updateClock, 30000);

  var yearNode = $("#year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  /* ---------- 06 · Custom cursor ---------- */

  if (finePointer && !reduceMotion) {
    doc.classList.add("has-cursor");
    var cursor = $(".cursor");
    var ring = $(".cursor-ring");
    var ringLabel = $(".cursor-ring__label");
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;
    var pointerActive = false;

    function moveCursor(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      pointerActive = true;
      doc.classList.remove("cursor-hidden");
      doc.classList.add("cursor-ready");
      if (cursor) cursor.style.transform = "translate3d(" + mouseX + "px," + mouseY + "px,0)";
    }

    function animateRing() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ring) ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
      requestAnimationFrame(animateRing);
    }

    window.addEventListener("pointermove", moveCursor, { passive: true });
    animateRing();

    document.addEventListener("pointerover", function (e) {
      var target = e.target.closest("a, button, [data-cursor]");
      if (!target) {
        if (ring) ring.classList.remove("is-hover", "is-label");
        return;
      }
      var labelText = target.getAttribute("data-cursor");
      if (labelText && ring && ringLabel) {
        ringLabel.textContent = labelText;
        ring.classList.add("is-label");
        ring.classList.remove("is-hover");
      } else if (ring) {
        ring.classList.add("is-hover");
        ring.classList.remove("is-label");
      }
    });

    document.addEventListener("pointerout", function (e) {
      if (e.relatedTarget) return;
      if (ring) ring.classList.remove("is-hover", "is-label");
    });
    document.addEventListener("mouseleave", function () {
      if (pointerActive) doc.classList.add("cursor-hidden");
    });
    document.addEventListener("mouseenter", function () {
      doc.classList.remove("cursor-hidden");
    });
  }

  /* ---------- 07 · Magnetic buttons ---------- */

  if (finePointer && !reduceMotion) {
    $$("[data-magnetic]").forEach(function (element) {
      var resetTimer;

      element.addEventListener("pointermove", function (e) {
        var rect = element.getBoundingClientRect();
        var x = (e.clientX - (rect.left + rect.width / 2)) * 0.16;
        var y = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
        window.clearTimeout(resetTimer);
        element.style.transition = "transform 0.12s linear";
        element.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)";
      });

      element.addEventListener("pointerleave", function () {
        element.style.transition = "transform 0.55s cubic-bezier(0.16,1,0.3,1)";
        element.style.transform = "translate3d(0,0,0)";
        resetTimer = window.setTimeout(function () {
          element.style.transition = "";
          element.style.transform = "";
        }, 600);
      });
    });
  }

  /* ---------- 08 · Tilt + spotlight on cards ---------- */

  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(function (element) {
      var resetTimer;

      element.addEventListener("pointermove", function (e) {
        if (window.innerWidth < 860) return;
        var rect = element.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotateX = (0.5 - py) * 2.2;
        var rotateY = (px - 0.5) * 2.2;

        if (element.classList.contains("project")) {
          element.style.setProperty("--mx", (px * 100).toFixed(2) + "%");
          element.style.setProperty("--my", (py * 100).toFixed(2) + "%");
        }

        window.clearTimeout(resetTimer);
        element.style.transition = "transform 0.16s linear, border-color 0.45s, background-color 0.45s";
        element.style.transform =
          "perspective(1400px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
      });

      element.addEventListener("pointerleave", function () {
        element.style.transition = "transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color 0.45s, background-color 0.45s";
        element.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg)";
        resetTimer = window.setTimeout(function () {
          element.style.transition = "";
          element.style.transform = "";
        }, 760);
      });
    });
  }

  /* ---------- 09 · Mobile menu ---------- */

  var menu = $("#mobile-menu");
  var menuToggle = $("#menu-toggle");
  var menuClose = $("#menu-close");
  var main = $("#main");
  var footer = $(".footer");

  function setMenu(open) {
    if (!menu || !menuToggle) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (open) {
      var firstLink = $("a, button", menu);
      if (firstLink) window.setTimeout(function () { firstLink.focus(); }, 250);
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
  }
  if (menuClose) {
    menuClose.addEventListener("click", function () {
      setMenu(false);
      if (menuToggle) menuToggle.focus();
    });
  }
  if (menu) {
    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    menu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = $$("a, button", menu).filter(function (el) { return el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && menu.classList.contains("is-open")) {
      setMenu(false);
      if (menuToggle) menuToggle.focus();
    }
  });

  var desktopQuery = window.matchMedia("(min-width: 981px)");
  function handleDesktopChange(e) {
    if (e.matches && menu && menu.classList.contains("is-open")) setMenu(false);
  }
  if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", handleDesktopChange);
  else if (desktopQuery.addListener) desktopQuery.addListener(handleDesktopChange);

  /* ---------- 10 · Copy email ---------- */

  var copyButton = $("#copy-email");
  var toast = $("#toast");
  var copiedTimer;
  var toastTimer;

  function fallbackCopy(value) {
    var area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var succeeded = false;
    try { succeeded = document.execCommand("copy"); } catch (err) { succeeded = false; }
    document.body.removeChild(area);
    return succeeded;
  }

  function showCopied() {
    if (copyButton) {
      copyButton.classList.add("is-copied");
      var label = $("span", copyButton);
      if (label) label.textContent = "Copied";
      window.clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(function () {
        copyButton.classList.remove("is-copied");
        if (label) label.textContent = "Copy";
      }, 2600);
    }
    if (toast) {
      toast.classList.add("is-visible");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 2600);
    }
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var email = copyButton.getAttribute("data-email") || "shivanshtri010@gmail.com";
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(showCopied).catch(function () {
          if (fallbackCopy(email)) showCopied();
        });
      } else if (fallbackCopy(email)) {
        showCopied();
      }
    });
  }

  /* ---------- 11 · WebGL hero ---------- */

  var hero = $("#top");
  var heroCanvas = $("#hero-canvas");
  if (hero && heroCanvas) {
    var shaderReady = false;
    try {
      shaderReady = typeof window.initHeroShader === "function" && window.initHeroShader(heroCanvas);
    } catch (err) {
      shaderReady = false;
    }
    if (!shaderReady) hero.classList.add("no-webgl");
  }
})();
