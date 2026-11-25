# Shivansh Tripathi — Portfolio

A dark, quiet portfolio for a software engineer working on distributed systems, event-driven backends and applied AI. Hand-written HTML, CSS and vanilla JavaScript — no build step, no framework, no runtime dependencies.

**Live:** <https://shivanshtri010.github.io/>


The design borrows Apple's product-page discipline (generous space, one idea per screen, motion that explains rather than decorates) and applies it to an editorial layout: oversized Geist display type, JetBrains Mono metadata, a single italic serif accent, titanium silver as the only "colour", and one small lime status dot.

## Preview locally

```powershell
python -m http.server 4173
```

Then open <http://127.0.0.1:4173>. A local server is required for the self-hosted fonts and the case-study scripts to behave exactly as they do in production.

## Structure

```
index.html                    All page content, case studies, structured data, social metadata
privacy.html                  Privacy and analytics notice with a reset control
404.html                      Branded not-found page (uses a base href for asset paths)
favicon.svg                   Monogram icon
apple-touch-icon.png          Home-screen icon
robots.txt / sitemap.xml      Crawler hints and the URL set
DEPLOYMENT.md                 GitHub Pages, custom domain, PostHog and Cloudflare setup
assets/css/fonts.css          Self-hosted @font-face declarations
assets/css/main.css           Design tokens, base type, navigation, hero, footer, toast, consent
assets/css/sections.css       Highlights, work, diagrams, case panels, about, experience, stack, contact
assets/css/responsive.css     Breakpoints, no-JS navigation, print
assets/js/main.js             Reveals, counters, scroll state, menu, accordions, copy email, parallax
assets/js/config.js           Public site URL, PostHog key, Cloudflare token
assets/js/analytics.js        Consent-gated PostHog + Cloudflare Web Analytics and custom events
assets/fonts/                 Geist, Instrument Serif Italic, JetBrains Mono (WOFF2, subset)
assets/media/                 Résumé PDF and the 1200×630 social card
.github/workflows/deploy.yml  Deploys the static files to GitHub Pages
```

## Editing

- **Copy and projects:** everything lives in `index.html`. Each project card is self-contained: summary, stack, metrics, clickable inline SVG architecture diagram and an expandable case study. Click (or focus and press Enter on) a diagram to step through its request flow; it resets when you click past the last step, press Escape, or move focus away.
- **Links:** LinkedIn, GitHub, LeetCode, email and phone appear in `index.html` and in the JSON-LD block at the top of the file.
- **Résumé:** replace `assets/media/Shivansh_Tripathi_Resume.pdf` and keep the filename, or update the three download links.
- **Colours and type:** edit the custom properties at the top of `assets/css/main.css`.
- **Social card:** `assets/media/og.png` is a 1200×630 PNG. Replace it and keep the dimensions, or update the `og:image:width` and `og:image:height` tags.
- **Analytics:** fill in `assets/js/config.js`. See `DEPLOYMENT.md` §5–6. Nothing loads until a visitor opts in.

## Design notes

- **Palette:** `#08090D`, `#0B1020`, `#11141C` for surfaces; `#F5F5F2`, `#A1A1AA`, `#71717A` for text. Titanium gradient for the hero name, a sparing `#C8F56F` for status and the single accent.
- **Type as layout:** Geist for display and body, JetBrains Mono for labels and numerals, Instrument Serif Italic for one or two emphasised words per section.
- **Glass, used selectively:** the floating navigation, the contact panel and the consent sheet are the only blurred surfaces. Everything else is flat, bordered and quiet.
- **Motion:** IntersectionObserver reveals, counter roll-ups, a scroll progress line, gentle hero parallax and a pointer-tracked glow. All of it respects `prefers-reduced-motion`, and no motion hijacks scrolling.
- **Real content only.** Every metric — `1+` years, `400+` hours per month, `95%` validation accuracy, `2×` hackathon wins, 40+ production issues, 80% test coverage — comes from the résumé.

## Accessibility & performance

- Semantic landmarks, one `h1`, a skip link, visible focus rings, labelled controls and descriptive link text.
- Case studies use `aria-expanded`, `inert` and a grid-row transition; the content is still readable with JavaScript disabled.
- Reduced-motion support throughout, and the mobile menu is a focus trap that closes on Escape.
- Self-hosted subset fonts, no third-party requests until analytics consent, no framework, no image-heavy hero.
- All project visuals are inline SVG diagrams, so they stay crisp and cost almost nothing.

## Deployment

GitHub Pages via GitHub Actions, with an optional Name.com student domain. The complete guide — Actions setup, DNS records, HTTPS, PostHog, Cloudflare Web Analytics, the privacy model and a QA checklist — is in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Git

```
aae2f48  chore: scaffold portfolio site
b27aed3  feat: build portfolio UI and interactions
v1-editorial  tag on the first editorial design, kept for reference
```
