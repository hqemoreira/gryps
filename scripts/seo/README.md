# SEO ops tooling (not public product UI)

Closed loop for GRYPS discoverability ([issue #3](https://github.com/ghostcat0to1/gryps/issues/3) Phase 2–3 + [issue #4](https://github.com/ghostcat0to1/gryps/issues/4)):

1. **Pull Search Console** → `seo/gsc-latest.json`
2. **Pull Keyword Planner** (when Ads token approved) → `seo/planner-{topic}.json`
3. **Propose pages** → `seo/proposals-latest.json` (feed to an agent / issue #3 backlog)

No CSV export step.

---

## Env checklist

Copy these into local env (never commit secrets). Prefer `vercel env add` for any CI secrets.

| Variable | Required | Purpose |
|---|---|---|
| `GSC_SITE_URL` | Yes | Property URL as in Search Console, e.g. `https://gryps.vercel.app/` or `sc-domain:gryps.fi` |
| `GSC_CREDENTIALS_PATH` | One of | Path to service-account JSON key |
| `GOOGLE_APPLICATION_CREDENTIALS` | One of | Same as above (Google default) |
| `GSC_SERVICE_ACCOUNT_JSON` | One of | Inline JSON string (CI) |
| `GSC_DAYS` | No | Lookback days (default `28`) |
| `GSC_ROW_LIMIT` | No | Max rows per dimension query (default `250`) |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Planner | Ads developer token |
| `GOOGLE_ADS_CUSTOMER_ID` | Planner | Ads customer ID (no dashes) |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Planner | MCC ID if using a manager account |
| `GOOGLE_ADS_CREDENTIALS_PATH` | Planner | OAuth/refresh credentials for Ads (or reuse GSC path if same GCP project + Ads scope) |

### One-time Google setup (Search Console)

**Windows helper (recommended):**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/seo/setup-gsc.ps1 -Pull
```

This opens the GCP + Search Console pages, waits for the JSON key at  
`%USERPROFILE%\.config\gryps\gsc-service-account.json`, writes  
`%USERPROFILE%\.config\gryps\seo.env`, sets User env vars, then pulls.

Manual steps (same outcome):

1. Create/select a GCP project.
2. Enable **Google Search Console API**: https://console.cloud.google.com/apis/library/searchconsole.googleapis.com
3. Create a **service account** → Keys → JSON (store **outside** the repo, e.g. `%USERPROFILE%\.config\gryps\gsc-service-account.json`).
4. In [Search Console](https://search.google.com/search-console) → Users → add the service account email (**Restricted** is enough).
5. Confirm the property matches `GSC_SITE_URL` (URL-prefix vs Domain property matters).
6. Do **not** put the key in repo `.env` / `.env.local` — use `seo.env` under `~/.config/gryps/` or User env vars.

### One-time Google setup (Keyword Planner — later)

1. Google Ads account with Keyword Planner access.
2. Apply for a **developer token** (test mode until production approval).
3. OAuth client + refresh token with Ads scopes (or Ads API client library flow).
4. Run `npm run seo:planner -- --topic "arctic satellite connectivity"`.

---

## Commands

```bash
# Pull GSC → seo/gsc-latest.json (+ opportunities)
npm run seo:gsc

# Keyword Planner stub until Ads token is ready
npm run seo:planner -- --topic "satellite connectivity arctic"

# Rank next knowledge pages from GSC (+ optional planner JSON)
npm run seo:propose
```

Outputs land in `seo/` (gitignored except examples). Commit only curated briefs you want in git history — not raw API dumps with account noise if you prefer privacy.

---

## Agent glue prompt

After `seo:gsc` / `seo:propose`:

> From `seo/gsc-latest.json` and `seo/proposals-latest.json` (and `seo/planner-*.json` if present), propose the next 5 knowledge pages for issue #3 Phase 2/3. Prefer high-impression weak-position queries, geography/sector topics for Nordic/Arctic satellite connectivity, and pages that can deep-link to `/map` and `/#advisor`. Output: slug, H1, primary keyword, intent, outline, internal links. No thin AI spam.
