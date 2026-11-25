/* ============================================================
   Optional, consent-gated analytics
   ------------------------------------------------------------
   - PostHog for page views, navigation, custom events, heatmaps
     and session replay (when enabled in the PostHog project).
   - Cloudflare Web Analytics for cookieless traffic summaries.
   - Nothing loads until the visitor accepts, and both tools stay
     off when Do Not Track or Global Privacy Control is enabled.
   ============================================================ */

(function () {
  "use strict";

  var config = window.PORTFOLIO_CONFIG || {};
  var STORAGE_KEY = "st-analytics-consent";
  var hasPosthog = Boolean(config.posthogKey);
  var hasCloudflare = Boolean(config.cloudflareToken);

  var consentBar = document.getElementById("analytics-consent");
  var analyticsStarted = false;
  var analyticsReady = false;
  var consented = false;
  var queue = [];

  function readChoice() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* Storage can be unavailable in private modes; the banner will
         simply appear again next visit. */
    }
  }

  function privacyOptOut() {
    return (
      navigator.doNotTrack === "1" ||
      window.doNotTrack === "1" ||
      navigator.globalPrivacyControl === true
    );
  }

  function showConsent() {
    if (!consentBar) return;
    consentBar.classList.add("is-visible");
  }

  function hideConsent() {
    if (!consentBar) return;
    consentBar.classList.remove("is-visible");
  }

  function sourceOf(element) {
    if (element.closest(".nav")) return "nav";
    if (element.closest(".mobile-menu")) return "mobile_menu";
    if (element.closest(".footer")) return "footer";
    var section = element.closest("section");
    if (section && section.id) return section.id === "top" ? "hero" : section.id;
    return "page";
  }

  function projectNameOf(element) {
    var project = element.closest(".project");
    if (!project) return null;
    var title = project.querySelector(".project__title");
    if (!title) return null;
    return title.textContent.replace(/\s+/g, " ").trim();
  }

  function capture(eventName, properties) {
    if (!consented) return;

    if (!analyticsReady) {
      queue.push([eventName, properties || {}]);
      return;
    }

    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(eventName, properties || {});
    }
  }

  function flushQueue() {
    if (!window.posthog || typeof window.posthog.capture !== "function") return;
    analyticsReady = true;

    while (queue.length) {
      var item = queue.shift();
      window.posthog.capture(item[0], item[1]);
    }
  }

  function loadPosthog() {
    if (!hasPosthog || window.__portfolioPosthog) return;
    window.__portfolioPosthog = true;

    /* Official PostHog JS snippet, kept inline so analytics.js remains a
       single file and the SDK is never fetched before consent. */
    !(function (t, e) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1]));
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.crossOrigin = "anonymous"),
            (p.async = !0),
            (p.src =
              s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") +
              "/static/array.js"),
            (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
          var u = e;
          void 0 !== a ? (u = e[a] = []) : (a = "posthog");
          u.people = u.people || [];
          Object.defineProperty(u, "toString", {
            configurable: !0,
            enumerable: !0,
            writable: !0,
            value: function (t) {
              var e = "posthog";
              return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
            }
          });
          Object.defineProperty(u.people, "toString", {
            configurable: !0,
            enumerable: !0,
            writable: !0,
            value: function () {
              return u.toString(1) + ".people (stub)";
            }
          });
          o =
            "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(
              " "
            );
          for (n = 0; n < o.length; n++) g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
    })(document, window.posthog || []);

    window.posthog.init(config.posthogKey, {
      api_host: config.posthogHost || "https://us.i.posthog.com",
      defaults: "2026-08-30",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: ".ph-mask"
      },
      loaded: flushQueue
    });

    /* If a blocker prevents the SDK from loading, stop buffering. */
    window.setTimeout(flushQueue, 5000);
  }

  function loadCloudflare() {
    if (!hasCloudflare || document.getElementById("cf-web-analytics")) return;

    var beacon = document.createElement("script");
    beacon.id = "cf-web-analytics";
    beacon.defer = true;
    beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
    beacon.setAttribute(
      "data-cf-beacon",
      JSON.stringify({ token: config.cloudflareToken })
    );
    document.head.appendChild(beacon);
  }

  function observeSections() {
    if (!("IntersectionObserver" in window)) return;

    var sections = document.querySelectorAll("main section[id]");
    if (!sections.length) return;

    var seen = {};

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          if (!id || seen[id]) return;
          seen[id] = true;
          capture("section_viewed", { section: id === "top" ? "hero" : id });
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "-22% 0px -58% 0px", threshold: 0 }
    );

    Array.prototype.forEach.call(sections, function (section) {
      observer.observe(section);
    });
  }

  function startAnalytics() {
    if (analyticsStarted) return;
    analyticsStarted = true;
    consented = true;
    loadPosthog();
    loadCloudflare();
    observeSections();
  }

  function trackClick(event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") return;
    if (target.closest("#analytics-consent")) return;

    var link = target.closest("a");
    var button = target.closest("button");

    if (button) {
      if (button.id === "copy-email") {
        capture("email_copied", { source: "contact" });
      } else if (
        button.classList.contains("case-toggle") &&
        button.getAttribute("aria-expanded") === "true"
      ) {
        capture("project_opened", {
          project_name: projectNameOf(button) || "unknown"
        });
      }
      return;
    }

    if (!link) return;

    var href = link.getAttribute("href") || "";
    var source = sourceOf(link);
    var projectName = projectNameOf(link);

    if (link.classList.contains("case-toggle")) return;

    if (link.hasAttribute("download") && /\.pdf($|\?)/i.test(href)) {
      capture("resume_downloaded", { source: source });
      return;
    }

    if (href.indexOf("https://github.com/") === 0) {
      capture("github_repository_clicked", {
        project_name: projectName || undefined,
        source: source
      });
      return;
    }

    if (href.indexOf("https://linkedin.com/") === 0 || href.indexOf("https://www.linkedin.com/") === 0) {
      capture("linkedin_clicked", { source: source });
      return;
    }

    if (href.indexOf("https://instagram.com/") === 0 || href.indexOf("https://www.instagram.com/") === 0) {
      capture("instagram_clicked", { source: source });
      return;
    }

    if (href.indexOf("mailto:") === 0) {
      var isConversation = link.classList.contains("btn");
      capture(isConversation ? "contact_clicked" : "email_clicked", {
        method: "email",
        source: source
      });
      return;
    }

    if (href.indexOf("tel:") === 0) {
      capture("contact_clicked", { method: "phone", source: source });
      return;
    }

    if (link.getAttribute("href") === "#contact") {
      capture("contact_clicked", { method: "jump", source: source });
      return;
    }

    if (/^https?:\/\//i.test(href)) {
      var destination = "external";
      try {
        destination = new URL(href).hostname.replace(/^www\./, "");
      } catch (error) {
        destination = "external";
      }
      capture("external_link_clicked", { destination: destination, source: source });
    }
  }

  function init() {
    if (!hasPosthog && !hasCloudflare) return;
    if (privacyOptOut()) return;

    var host = window.location.hostname;
    var isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "";
    if (isLocal && !config.analyticsOnLocalhost) return;
    if (window.location.protocol === "file:") return;

    var choice = readChoice();

    if (choice === "granted") {
      startAnalytics();
      return;
    }

    if (choice === "denied") return;

    window.setTimeout(showConsent, 1100);
  }

  if (consentBar) {
    consentBar.addEventListener("click", function (event) {
      var button = event.target.closest("[data-consent]");
      if (!button) return;

      var choice = button.getAttribute("data-consent");
      var granted = choice === "grant";

      saveChoice(granted ? "granted" : "denied");
      hideConsent();

      if (granted) startAnalytics();
    });
  }

  document.addEventListener("click", trackClick);
  init();
})();
