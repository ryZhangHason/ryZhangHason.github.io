# Visitor Analytics Backend

This folder contains a Cloudflare Workers + D1 implementation for the private visitor analytics backend.

## What it provides

- `POST /api/track` for public event ingestion
- `POST /api/login` and `POST /api/logout` for dashboard auth
- `GET /api/stats/summary` for the overview cards, top pages, and recent visits
- `GET /api/stats/visits` for raw recent sessions
- `GET /api/stats/pages` for page aggregates
- `/dashboard` for the private admin UI

## Deploy

1. Install Wrangler locally.
2. Create a D1 database.
3. Replace `database_id` in `wrangler.toml`.
4. Apply the schema:

```bash
wrangler d1 execute visitor-analytics --file=./sql/schema.sql
```

5. Set secrets:

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put COOKIE_SECRET
wrangler secret put IP_SALT
```

6. Deploy:

```bash
wrangler deploy
```

7. Copy the deployed `/api/track` URL into [`_config.yml`](../_config.yml) under `visitor_analytics.endpoint`.

## Notes

- The public site stays on GitHub Pages.
- Visitor identity is browser-level and privacy-safe by default through a generated anonymous ID.
- The backend stores an IP-derived hash only when `IP_SALT` is configured.
- The dashboard is protected by an admin password cookie signed with `COOKIE_SECRET`.
