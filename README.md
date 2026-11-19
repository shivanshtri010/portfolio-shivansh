# Shivansh Tripathi — Portfolio

A dark, editorial portfolio for a software engineer working on distributed systems and applied AI. Built as a static site with hand-written HTML, CSS and vanilla JavaScript. The hero uses a custom WebGL silk field; everything else is CSS and SVG.

## Preview locally

From this folder:

```powershell
python -m http.server 4173
```

Then open <http://127.0.0.1:4173>.

No build step and no npm dependencies. Three.js is vendored locally, so the page runs offline apart from the outbound profile links.

## Structure

```
index.html                  All content and markup
assets/css/fonts.css        Self-hosted font faces
assets/css/styles.css       Tokens, base, buttons, navigation, hero, marquee
assets/css/sections.css     Work, project visuals, about, experience
assets/css/sections2.css    Stack, proof, contact, footer, motion
assets/css/responsive.css   Breakpoints and reduced-motion behaviour
assets/js/shader.js         WebGL hero background (Three.js)
assets/js/main.js           Motion, cursor, reveals, counters, menu, copy email
assets/fonts/               Syne, Manrope, Instrument Serif, JetBrains Mono
assets/media/               Résumé PDF served by the download buttons
assets/vendor/three.min.js  Three.js r152
scripts/fonts.py            One-off Google Fonts downloader used during setup
```

## Design notes

- **Obsidian canvas, one accent.** Near-black backgrounds, off-white text, acid lime `#d6ff45` as the single focal colour, with violet and mint reserved for the WebGL field and data visuals.
- **Type as layout.** Oversized Syne for display, Instrument Serif italic for emotional emphasis, JetBrains Mono for data and labels.
- **Restrained motion.** Masked character reveals, scroll-triggered fades, a marquee, magnetic buttons, a two-layer cursor, and a small 3D tilt on cards. All disabled or simplified under `prefers-reduced-motion`.
- **Real content.** Experience, metrics, projects and achievements come from Shivansh's résumé. No placeholder copy.

## Editing

- **Links:** update LinkedIn, GitHub, LeetCode and email in `index.html`, plus the structured-data block in `<head>`.
- **Résumé:** replace `assets/media/Shivansh_Tripathi_Resume.pdf` and keep the filename, or update the two download links.
- **Colours:** change the custom properties at the top of `assets/css/styles.css`.
- **Projects:** each project card is self-contained in `index.html`. The abstract visuals are CSS/SVG, so there are no image assets to swap.
- **Deploying:** drag the folder into Netlify, Vercel, Cloudflare Pages or GitHub Pages. It is fully static.

## Accessibility & performance

- Keyboard skip link, visible focus states, labelled controls, reduced-motion support.
- Local fonts, no render-blocking third-party resources, lazy WebGL that pauses off-screen and in background tabs.
- Semantic landmarks, one `h1`, descriptive link labels, decorative visuals hidden from assistive technology.

## Git

The project is versioned locally. Initial commit: `chore: scaffold portfolio site`.
