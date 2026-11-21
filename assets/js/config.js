/* ============================================================
   Public site configuration
   ------------------------------------------------------------
   1. Replace the placeholders with your own public identifiers.
   2. Never put a PostHog personal API key here. Only the project
      token (starts with "phc_") is safe to ship in a browser.
   3. Leave a value empty to disable that integration entirely.
   ============================================================ */

window.PORTFOLIO_CONFIG = {
  // Used by documentation and future absolute links. Update alongside
  // the canonical URL in index.html when the custom domain is live.
  siteUrl: "https://shivanshtri010.github.io/portfolio-shivansh",

  // PostHog → Project settings → Project API key (public).
  // Example: "phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  posthogKey: "",
  posthogHost: "https://us.i.posthog.com",

  // Cloudflare → Web Analytics → Add a site → JS snippet token.
  // This is a public beacon token, not an API key.
  cloudflareToken: "",

  // Keep local previews out of your analytics. Set true only while
  // deliberately testing event delivery.
  analyticsOnLocalhost: false
};
