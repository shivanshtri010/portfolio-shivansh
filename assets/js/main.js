/* ============================================================
   Shivansh Tripathi — portfolio interactions
   Vanilla JS. No runtime dependencies.
   ============================================================ */

(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.prototype.slice.call((context || document).querySelectorAll(selector)); };

  /* ---------- 01 · Reveal on scroll ---------- */

  var revealElements = $$("[data-reveal]");
  var revealGroups = new Map();

  revealElements.forEach(function (element) {
    var parent = element.parentElement;
    if (!revealGroups.has(parent)) revealGroups.set(parent, []);
    revealGroups.get(parent).push(element);
  });

  revealGroups.forEach(function (children) {
    if (children.length < 2) return;
    children.forEach(function (element, index) {
      element.style.setProperty("--delay", Math.min(index * 0.06, 0.24).toFixed(3) + "s");
    });
  });

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

    requestAnimationFrame(function () {
      revealElements.forEach(function (element) {
        if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
          element.classList.add("is-in");
        }
      });
    });
  }

  /* ---------- 02 · Counters ---------- */

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

    // Markup ships the final value for no-JS readers; reset only when the
    // animation can actually run.
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

  /* ---------- 03 · Scroll state, progress, active nav ---------- */

  var nav = $("#nav");
  var progressBar = $("#scroll-progress-bar");
  var navLinks = $$("[data-nav]");
  var navSections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);
  var ticking = false;
  var scrollSpan = 0;
  var sectionTops = [];

  /* Cache geometry so scroll frames read and write without interleaving
     layout queries and style updates (which forces a reflow). */
  function measureScroll() {
    scrollSpan = Math.max(doc.scrollHeight - window.innerHeight, 0);
    sectionTops = navSections.map(function (section) {
      return { id: section.id, top: section.offsetTop };
    });
  }

  function updateScrollUI() {
    var y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle("is-scrolled", y > 24);

    if (progressBar) {
      var ratio = scrollSpan > 0 ? Math.min(Math.max(y / scrollSpan, 0), 1) : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
    }

    var activeId = "";
    var marker = y + window.innerHeight * 0.34;

    sectionTops.forEach(function (section) {
      if (section.top <= marker) activeId = section.id;
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
  window.addEventListener("resize", function () {
    measureScroll();
    requestScrollUI();
  });
  window.addEventListener("load", measureScroll);
  measureScroll();
  updateScrollUI();

  /* ---------- 04 · Clocks and year ---------- */

  var clockFormat;
  try {
    clockFormat = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  } catch (err) {
    clockFormat = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }

  var timeNodes = [$("#local-time"), $("#contact-time"), $("#foot-time")].filter(Boolean);

  function updateClock() {
    var value = clockFormat.format(new Date());
    timeNodes.forEach(function (node) { node.textContent = value; });
  }

  updateClock();
  window.setInterval(updateClock, 30000);

  var yearNode = $("#year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  /* ---------- 05 · Mobile menu ---------- */

  var menu = $("#mobile-menu");
  var menuToggle = $("#menu-toggle");
  var menuClose = $("#menu-close");
  var main = $("#main");
  var footer = $(".footer");

  function setMenu(open, returnFocus) {
    if (!menu || !menuToggle) return;

    menu.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);

    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (nav) nav.inert = open;

    if (open) {
      menu.setAttribute("aria-hidden", "false");
      window.setTimeout(function () {
        if (menuClose) menuClose.focus();
      }, 60);
    } else {
      if (returnFocus && menuToggle) {
        menuToggle.focus();
      }
      menu.setAttribute("aria-hidden", "true");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"), false);
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", function () {
      setMenu(false, true);
    });
  }

  if (menu) {
    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false, true);
      });
    });

    menu.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;

      var focusable = $$("a, button", menu).filter(function (element) {
        return element.offsetParent !== null;
      });

      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu && menu.classList.contains("is-open")) {
      setMenu(false, true);
    }
  });

  var desktopQuery = window.matchMedia("(min-width: 981px)");

  function handleDesktopChange(event) {
    if (event.matches && menu && menu.classList.contains("is-open")) {
      setMenu(false, false);
    }
  }

  if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", handleDesktopChange);
  else if (desktopQuery.addListener) desktopQuery.addListener(handleDesktopChange);

  /* ---------- 06 · Case study accordions ---------- */

  $$(".case-toggle").forEach(function (button) {
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    var card = button.closest(".project");
    var label = $(".case-toggle__label", button);

    if (!panel || !card) return;

    function setOpen(open) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      card.classList.toggle("is-open", open);
      panel.inert = !open;
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      if (label) label.textContent = open ? "Close case study" : "Read case study";
      window.setTimeout(measureScroll, 650);
    }

    setOpen(false);

    button.addEventListener("click", function () {
      var isOpen = button.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });
  });

  /* ---------- 07 · Pointer light on glass surfaces ---------- */

  if (finePointer && !reduceMotion) {
    $$("[data-glow]").forEach(function (element) {
      element.addEventListener("pointermove", function (event) {
        var rect = element.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;
        element.style.setProperty("--mx", x.toFixed(2) + "%");
        element.style.setProperty("--my", y.toFixed(2) + "%");
      }, { passive: true });
    });
  }

  /* ---------- 08 · Hero lens parallax ---------- */

  var hero = $("#top");

  if (hero && finePointer && !reduceMotion) {
    var frame = 0;
    var targetX = 0;
    var targetY = 0;

    function applyParallax() {
      hero.style.setProperty("--px", targetX.toFixed(3));
      hero.style.setProperty("--py", targetY.toFixed(3));
      frame = 0;
    }

    hero.addEventListener("pointermove", function (event) {
      var x = (event.clientX / window.innerWidth) * 2 - 1;
      var y = (event.clientY / window.innerHeight) * 2 - 1;
      targetX = Math.max(-1, Math.min(1, x));
      targetY = Math.max(-1, Math.min(1, y));
      if (!frame) frame = requestAnimationFrame(applyParallax);
    }, { passive: true });

    hero.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = requestAnimationFrame(applyParallax);
    });
  }

  /* ---------- 09 · Copy email ---------- */

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
})();
