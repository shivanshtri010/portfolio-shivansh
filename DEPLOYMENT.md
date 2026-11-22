# Deployment, domain and analytics

This portfolio is a static site: hand-written HTML, CSS and vanilla JavaScript with no build step. That keeps the first render fast, keeps every word readable without JavaScript, and removes the dependency chain that a React/Vite deployment would add for a five-section portfolio.

Everything below can run on free tiers. The only possible recurring cost is the custom domain after the GitHub Student Developer Pack offer ends — check the renewal price at Name.com before committing.

## Current state

- **Deployed:** <https://shivanshtri010.github.io/portfolio-shivansh/> — GitHub Pages, Actions source, HTTPS enforced. The repository is public and its homepage points at this URL.
- The site deploys to the default project URL, **`https://shivanshtri010.github.io/portfolio-shivansh/`**.
- PostHog is **configured** in `assets/js/config.js` (US cloud project, consent-gated); `cloudflareToken` is still **empty**. With a key set, the consent banner appears, and no analytics script loads or network request leaves the page until the visitor chooses **Allow analytics**. If both keys are empty again, the banner is skipped entirely and the site works normally.
- There is **no `CNAME` file** and **no custom domain** configured yet. Do not create one until the domain is registered and ready; the deployment workflow only copies a `CNAME` file if one exists.
- `404.html` uses `<base href="/portfolio-shivansh/">` so its fonts, styles and links resolve from any missing sub-path. Change this to `/` when the custom domain goes live, or the 404 page will look for assets under the old project path.
- The absolute URLs in `index.html`, `privacy.html`, `sitemap.xml`, `robots.txt` and `config.js` point at the GitHub Pages URL above. They must all change together when the domain goes live (section 4.3).

---

## 1. Put the site on GitHub

The repository must exist before the first push. Choose one route.

### Route A — GitHub CLI (recommended)

```powershell
winget install --id GitHub.cli
gh auth login          # GitHub.com → HTTPS → login with a browser
gh repo create portfolio-shivansh --public --source . --remote origin --push
```

### Route B — create it in the browser

1. Open <https://github.com/new>.
2. Name it **`portfolio-shivansh`**, set visibility to **Public**, and do **not** add a README, `.gitignore` or licence (the local repo already has content).
3. Create the repository, then from this folder:

```powershell
git remote add origin https://github.com/shivanshtri010/portfolio-shivansh.git
git branch -M main
git push -u origin main
```

If a `origin` remote already exists, use `git remote set-url origin <url>` instead of `git remote add`.

The commit history is already local; there is nothing to initialise. Verify with `git log --oneline` and `git remote -v`.

> If the repository has a different name, update the canonical, Open Graph and sitemap URLs described in section 4.

> **Credentials:** do not paste a personal access token into the repository. Signing in through `gh auth login` or Git Credential Manager keeps the token in the OS credential store.


---

## 2. Turn on GitHub Pages with Actions

1. Open the repository → **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main`, or run **Actions → Deploy portfolio to GitHub Pages → Run workflow**.
4. The workflow in `.github/workflows/deploy.yml` publishes the site and prints the URL in the `github-pages` environment.

The workflow uploads only the site files (`index.html`, `privacy.html`, `404.html`, `assets`, `favicon.svg`, `apple-touch-icon.png`, `robots.txt`, `sitemap.xml`, and `CNAME` if present). README, deployment docs and the workflow itself are not published.

The first deploy should be available at:

```
https://shivanshtri010.github.io/portfolio-shivansh/
```

Every path in the site is relative, so it works both at that subpath and at a custom apex domain.

**If the branch is not `main`**, change `branches: [main]` in `.github/workflows/deploy.yml`.

### 2.1 Verify the live site

Once the workflow is green:

1. Open `https://shivanshtri010.github.io/portfolio-shivansh/`.
2. Confirm the page loads over HTTPS with no console errors.
3. Check `https://shivanshtri010.github.io/portfolio-shivansh/robots.txt` and `/sitemap.xml`.
4. Open the deployed URL in a private window. With the analytics keys empty, **no consent banner should appear** and the DevTools Network tab should show no requests to `posthog.com` or `cloudflareinsights.com`.
5. Test the mobile menu, a case study toggle, the résumé download, the email copy button and the privacy link.
6. Run Lighthouse on the live URL and record the four scores.
7. If the deploy shows a 404, re-check **Settings → Pages → Source = GitHub Actions** and that the workflow ran on `main`.


---

## 3. Claim the domain through the GitHub Student Developer Pack

1. Open <https://education.github.com/pack> and find the **Name.com** offer.
2. Verify the TLDs included in the offer and the renewal price. A free first year is common; renewal is not guaranteed to be free.
3. Register the domain with the student offer and keep the Name.com account accessible.

Do not choose a domain based only on the first-year price. Check what it costs to renew, and confirm the TLD is eligible for the student offer.

---

## 4. Connect the custom domain

### 4.1 DNS records at Name.com

In Name.com → **My Domains → DNS Management**, add the following. Use `@` for the apex domain.

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 300 |
| A | `@` | `185.199.109.153` | 300 |
| A | `@` | `185.199.110.153` | 300 |
| A | `@` | `185.199.111.153` | 300 |
| AAAA | `@` | `2606:50c0:8000::153` | 300 |
| AAAA | `@` | `2606:50c0:8001::153` | 300 |
| AAAA | `@` | `2606:50c0:8002::153` | 300 |
| AAAA | `@` | `2606:50c0:8003::153` | 300 |
| CNAME | `www` | `shivanshtri010.github.io` | 300 |

Remove conflicting `A`, `AAAA` or `CNAME` records for `@` and `www` that Name.com may have added. Do not use a `CNAME` at the apex; use the four `A` and four `AAAA` records instead.

These are GitHub Pages' documented addresses. Verify them against GitHub's current documentation if anything changes.

### 4.2 Tell GitHub Pages about the domain

1. Repository → **Settings → Pages → Custom domain**.
2. Enter the apex domain, for example `shivanshtripathi.com`, and save.
3. GitHub will check DNS. This can take minutes to a few hours.
4. Once the check passes, enable **Enforce HTTPS**. Certificate provisioning can take up to 24 hours.
5. Decide whether the apex or `www` is canonical. GitHub serves the configured custom domain and redirects the other host once DNS is correct.

Create a `CNAME` file at the repository root containing only the custom domain (no protocol, no slash):

```
shivanshtripathi.com
```

The deployment workflow copies it into the published artifact, so a future deploy keeps the domain. Commit it after the domain is final.

### 4.3 Update absolute URLs

The site currently uses the GitHub Pages URL as a safe placeholder. When the domain is live, update every absolute reference:

| File | What to change |
| --- | --- |
| `index.html` | `link rel="canonical"`, `og:url`, `og:image`, `twitter:image` |
| `privacy.html` | `link rel="canonical"`, `og:url` |
| `404.html` | `<base href="/">` |
| `sitemap.xml` | both `<loc>` values |
| `robots.txt` | the `Sitemap:` line |
| `assets/js/config.js` | `siteUrl` |

Use `https://your-domain.com/` for the homepage and `https://your-domain.com/privacy.html` for the notice. Keep the Open Graph image absolute:

```
https://your-domain.com/assets/media/og.png
```

Social crawlers need absolute image URLs; relative paths are not reliable for link previews.

### 4.4 Verify

```powershell
Resolve-DnsName your-domain.com
Resolve-DnsName www.your-domain.com
```

Then check:

- `https://your-domain.com/` loads over HTTPS.
- `https://www.your-domain.com/` redirects or loads correctly.
- The GitHub Pages URL still works.
- `https://your-domain.com/robots.txt` and `/sitemap.xml` resolve.
- No mixed-content warnings in DevTools.

### 4.5 Domain troubleshooting

| Symptom | Check |
| --- | --- |
| “Domain is not correctly configured” | Apex `A`/`AAAA` records, `www` CNAME, conflicting records, DNS propagation |
| 404 at the apex but GitHub URL works | The repository Pages source and branch; stale DNS cache |
| Certificate never provisions | Wait up to 24h, toggle the custom domain off/on, check for a restrictive `CAA` record |
| HTTPS checkbox disabled | DNS not fully propagated, or the domain check has not passed yet |
| `www` loops or fails | `www` CNAME must point to `shivanshtri010.github.io`, not to the apex |
| Old site appears | Flush DNS, test in a private window, check TTL/cache |

GitHub Pages is free for public repositories. The custom domain is free to attach; the domain registration is the only paid item and only after the student offer period.

---

## 5. PostHog analytics

The site ships with a consent-gated integration. No PostHog request is made until the visitor chooses **Allow analytics**.

### 5.1 Create the project and add the key

1. Create a free account at <https://posthog.com>.
2. Create a project, choosing the US or EU cloud region.
3. Open **Project settings → Project API key** and copy the public key beginning with `phc_`.
4. Open `assets/js/config.js` and replace the empty placeholder:

```js
posthogKey: "phc_REPLACE_WITH_YOUR_PROJECT_KEY",
posthogHost: "https://us.i.posthog.com" // or https://eu.i.posthog.com
```

5. Commit and deploy. Never put a personal API key here; only the project key is browser-safe.
6. Load the live site in a private window and confirm the consent banner appears after about a second.

**Current state:** PostHog is configured (US cloud, project key ending `…STTPKZ`), so the consent banner appears on the live site and PostHog loads only after **Allow analytics**. Cloudflare is still unconfigured. If you empty `posthogKey` again, `analytics.js` exits before creating a banner, loading a script or sending a request; the site stays fully functional. Cloudflare and PostHog are independent: setting only one key enables only that tool.

Cloudflare's token goes in the same file:

```js
cloudflareToken: "REPLACE_WITH_YOUR_BEACON_TOKEN"
```


### 5.2 Project settings to enable

In PostHog:

- **Product Analytics** — on (the site also sends named events for important actions).
- **Web Analytics** — on, for traffic and referrer summaries.
- **Autocapture** — on.
- **Session replay** — off in this project. The code is already prepared (`maskAllInputs`, `.ph-mask`) and replays start working once you enable it under **Settings → Session replay**; the snippet is not changed.
- **Heatmaps** — on, if available on your plan.
- **Discard client IP data** — enable if you want to minimise IP retention. PostHog may still derive coarse geography depending on project settings.
- **Person profiles** — the code uses `person_profiles: "identified_only"`; anonymous visitors should not get full profiles.

Check the current free-tier limits before enabling long replay retention. Limits change; the site does not depend on analytics to function.

### 5.3 Custom events

| Event | Fires when | Properties |
| --- | --- | --- |
| `section_viewed` | A section crosses the reading band | `section` |
| `project_opened` | A case study is expanded | `project_name` |
| `resume_downloaded` | Any resume PDF link is used | `source` |
| `github_repository_clicked` | A GitHub link is used | `source`, `project_name` when inside a project |
| `linkedin_clicked` | A LinkedIn link is used | `source` |
| `email_clicked` | The email address link is used | `method`, `source` |
| `email_copied` | The copy-email button is used | `source` |
| `contact_clicked` | “Let’s talk”, “Start a conversation”, or the phone link | `method`, `source` |
| `external_link_clicked` | Any other outbound link (for example LeetCode) | `destination`, `source` |

`source` is derived from the containing section (`hero`, `highlights`, `work`, `about`, `experience`, `stack`, `contact`) or from `nav`, `mobile_menu` and `footer`.

### 5.4 Verify collection

1. Deploy to a non-local host. Local analytics is intentionally disabled; set `analyticsOnLocalhost: true` in `config.js` only while testing.
2. Open the site in a private window, choose **Allow analytics**, then click a project, download the resume and open GitHub.
3. In PostHog, open **Activity → Live events** and confirm the named events and properties.
4. Check **Session replay** after a few minutes.
5. Use the PostHog dashboard to build insights for: unique visitors, top projects, resume downloads, GitHub/LinkedIn clicks and referral sources.

### 5.5 Analytics troubleshooting

| Symptom | Check |
| --- | --- |
| No banner appears | Both keys are empty, or you are on localhost, or DNT/GPC is on |
| Banner appears but no events | Consent was not granted, key/host is wrong, or a content blocker is active |
| Events arrive for local work | `analyticsOnLocalhost` is true; turn it off |
| No recordings | Session replay disabled in PostHog, consent missing, or replay quota reached |
| Missing page views | Consent given after the page loaded; `capture_pageview` is on in code |

---

## 6. Cloudflare Web Analytics

Cloudflare Web Analytics is supplementary traffic reporting. It is cookieless, but this site still gates it behind the same consent choice for consistency.

1. Open <https://dash.cloudflare.com> → **Analytics & Logs → Web Analytics**.
2. Choose **Add a site**, enter the custom domain, and copy the beacon token from the JS snippet.
3. Put the token into `assets/js/config.js`:

```js
cloudflareToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

4. Commit and deploy, then allow analytics on the live site.
5. The beacon is loaded from `https://static.cloudflareinsights.com/beacon.min.js` only after consent.

Do **not** move nameservers to Cloudflare, enable the proxy, or change DNS for this. Web Analytics reads the beacon; GitHub Pages remains the host. If you already use Cloudflare DNS for the domain, that is fine, but it is not required.

---

## 7. Privacy and consent

- No analytics script is loaded before **Allow analytics**.
- Do Not Track and Global Privacy Control automatically disable analytics without showing the banner.
- Local development does not send data.
- The choice is stored under `st-analytics-consent` in `localStorage`.
- The privacy notice is at `/privacy.html` and includes a reset control.
- Contact details carry `.ph-mask` so they are hidden in session replay; all inputs are masked by configuration.
- The site does not use advertising pixels, cross-site profiles or identity resolution.

If your legal context requires a different consent model, edit `assets/js/analytics.js` and `privacy.html` together.

---

## 8. Final QA checklist

- [ ] `python -m http.server 4173` and open <http://127.0.0.1:4173/>.
- [ ] Navigation, skip link, mobile menu and Escape key work.
- [ ] All four case studies open/close with keyboard and mouse.
- [ ] With JavaScript disabled, case-study content remains visible and the noscript section nav appears on mobile.
- [ ] Resume downloads from hero, experience and contact.
- [ ] Email copy shows the toast and updates the button label.
- [ ] All external links use `rel="noopener"`.
- [ ] A missing URL returns `404.html` with working styles, fonts and links.
- [ ] Social preview shows the correct title, description and 1200×630 image.
- [ ] No horizontal overflow at 1920, 1440, 1024, 768, 390 and 360 px.
- [ ] Reduced-motion preference removes animation without hiding content.
- [ ] Lighthouse: performance, accessibility, best practices and SEO.
- [ ] Deployed site: canonical, OG image, sitemap, robots and HTTPS.
- [ ] Analytics: consent, named events, replay masking and reset control.

---

## 9. Free-tier summary

| Service | Cost | Notes |
| --- | --- | --- |
| GitHub Pages | Free | Public repository |
| GitHub Actions | Free for public repos | Pages deployment |
| PostHog | Free tier | Limits vary; check current plan |
| Cloudflare Web Analytics | Free | Cookieless beacon |
| Name.com domain | Student offer, then renewal | Check eligibility and renewal price |

The portfolio has no database, no server runtime and no paid hosting dependency. If analytics is blocked or disabled, the site is unaffected.
