export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (path === "/api/track" && request.method === "POST") {
    return handleTrack(request, env);
  }

  if (path === "/api/login" && request.method === "POST") {
    return handleLogin(request, env);
  }

  if (path === "/api/logout" && request.method === "POST") {
    return handleLogout(request);
  }

  if (path === "/api/stats/summary" && request.method === "GET") {
    return withAuth(request, env, () => handleSummary(request, env));
  }

  if (path === "/api/stats/visits" && request.method === "GET") {
    return withAuth(request, env, () => handleVisits(request, url, env));
  }

  if (path === "/api/stats/pages" && request.method === "GET") {
    return withAuth(request, env, () => handlePages(request, url, env));
  }

  if (path === "/dashboard" && request.method === "GET") {
    return withAuth(request, env, () => htmlResponse(renderDashboardHtml()));
  }

  if (path === "/" && request.method === "GET") {
    return Response.redirect(new URL("/dashboard", url), 302);
  }

  return jsonResponse({ error: "Not found" }, 404, corsHeaders(request));
}

async function handleTrack(request, env) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON body" }, 400, corsHeaders(request));
  }

  const validation = validateTrackPayload(payload);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400, corsHeaders(request));
  }

  const receivedAt = new Date().toISOString();
  const eventAt = normalizeIso(payload.timestamp_client) || receivedAt;
  const path = cleanText(payload.path);
  const referrer = cleanText(payload.referrer);
  const userAgent = cleanText(request.headers.get("user-agent"));
  const country = cleanText(request.headers.get("cf-ipcountry"));
  const ipHash = await hashIp(request, env);
  const metadata = {
    landing_path: cleanText(payload.landing_path),
    navigation_reason: cleanText(payload.navigation_reason),
    end_reason: cleanText(payload.end_reason)
  };

  try {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at, first_path, last_path, created_ip_hash) " +
        "VALUES (?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT(visitor_id) DO UPDATE SET last_seen_at = excluded.last_seen_at, last_path = excluded.last_path"
      ).bind(payload.visitor_id, eventAt, eventAt, path, path, ipHash),
      env.DB.prepare(
        "INSERT INTO sessions (session_id, visitor_id, started_at, last_activity_at, ended_at, duration_seconds, entry_path, exit_path, referrer, user_agent, country, ip_hash) " +
        "VALUES (?, ?, ?, ?, NULL, 0, ?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT(session_id) DO UPDATE SET " +
        "last_activity_at = excluded.last_activity_at, " +
        "exit_path = excluded.exit_path, " +
        "referrer = COALESCE(sessions.referrer, excluded.referrer), " +
        "user_agent = COALESCE(sessions.user_agent, excluded.user_agent), " +
        "country = COALESCE(sessions.country, excluded.country), " +
        "duration_seconds = MAX(sessions.duration_seconds, CAST((julianday(excluded.last_activity_at) - julianday(sessions.started_at)) * 86400 AS INTEGER))"
      ).bind(payload.session_id, payload.visitor_id, eventAt, eventAt, path, path, referrer, userAgent, country, ipHash),
      env.DB.prepare(
        "INSERT OR IGNORE INTO events (" +
        "event_id, session_id, visitor_id, event_type, path, referrer, occurred_at, received_at, timezone, " +
        "screen_width, screen_height, viewport_width, viewport_height, language, page_title, navigation_reason, end_reason, ip_hash, user_agent, country, metadata_json" +
        ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        payload.event_id,
        payload.session_id,
        payload.visitor_id,
        payload.event_type,
        path,
        referrer,
        eventAt,
        receivedAt,
        cleanText(payload.timezone),
        intOrNull(payload.screen && payload.screen.width),
        intOrNull(payload.screen && payload.screen.height),
        intOrNull(payload.viewport && payload.viewport.width),
        intOrNull(payload.viewport && payload.viewport.height),
        cleanText(payload.language),
        cleanText(payload.page_title),
        metadata.navigation_reason,
        metadata.end_reason,
        ipHash,
        userAgent,
        country,
        JSON.stringify(metadata)
      )
    ]);

    if (payload.event_type === "session_end") {
      await env.DB.prepare(
        "UPDATE sessions SET ended_at = ?, last_activity_at = ?, exit_path = ?, " +
        "duration_seconds = MAX(duration_seconds, CAST((julianday(?) - julianday(started_at)) * 86400 AS INTEGER)) " +
        "WHERE session_id = ?"
      ).bind(eventAt, eventAt, path, eventAt, payload.session_id).run();
    }
  } catch (error) {
    return jsonResponse(
      { error: "Failed to store event", details: String(error && error.message ? error.message : error) },
      500,
      corsHeaders(request)
    );
  }

  return jsonResponse({ ok: true }, 202, corsHeaders(request));
}

async function handleLogin(request, env) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON body" }, 400, corsHeaders(request));
  }

  const password = typeof body.password === "string" ? body.password : "";
  const adminPassword = env.ADMIN_PASSWORD || "adminh";
  if (password !== adminPassword) {
    return jsonResponse({ error: "Invalid credentials" }, 401, corsHeaders(request));
  }

  const ttl = Number(env.SESSION_TTL_SECONDS || 604800);
  const expiresAt = Math.floor(Date.now() / 1000) + ttl;
  const authSecret = env.COOKIE_SECRET || "adminh";
  const token = `${expiresAt}.${await signValue(String(expiresAt), authSecret)}`;
  const cookieName = env.COOKIE_NAME || "visitor_analytics_admin";

  return jsonResponse(
    { ok: true, token, expires_at: expiresAt },
    200,
    {
      ...corsHeaders(request),
      "Set-Cookie": serializeCookie(cookieName, token, ttl)
    }
  );
}

async function handleLogout(request) {
  return jsonResponse({ ok: true }, 200, corsHeaders(request));
}

async function handleSummary(request, env) {
  const [overall, day, week, month, sessionCount, avgDuration, topPages, recent] = await Promise.all([
    singleValue(env, "SELECT COUNT(DISTINCT visitor_id) AS value FROM visitors"),
    singleValue(env, "SELECT COUNT(DISTINCT visitor_id) AS value FROM events WHERE occurred_at >= datetime('now', '-1 day')"),
    singleValue(env, "SELECT COUNT(DISTINCT visitor_id) AS value FROM events WHERE occurred_at >= datetime('now', '-7 day')"),
    singleValue(env, "SELECT COUNT(DISTINCT visitor_id) AS value FROM events WHERE occurred_at >= datetime('now', '-30 day')"),
    singleValue(env, "SELECT COUNT(*) AS value FROM sessions"),
    singleValue(env, "SELECT ROUND(AVG(duration_seconds), 1) AS value FROM sessions"),
    env.DB.prepare(
      "SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS unique_visitors FROM events " +
      "WHERE event_type = 'page_view' AND path IS NOT NULL AND path != '' " +
      "GROUP BY path ORDER BY views DESC LIMIT 10"
    ).all(),
    env.DB.prepare(
      "SELECT session_id, visitor_id, started_at, last_activity_at, duration_seconds, entry_path, exit_path, country " +
      "FROM sessions ORDER BY started_at DESC LIMIT 20"
    ).all()
  ]);

  return jsonResponse({
    total_unique_visitors: Number(overall || 0),
    unique_visitors_today: Number(day || 0),
    unique_visitors_7d: Number(week || 0),
    unique_visitors_30d: Number(month || 0),
    total_sessions: Number(sessionCount || 0),
    average_session_duration_seconds: Number(avgDuration || 0),
    top_pages: topPages.results || [],
    recent_visits: recent.results || []
  }, 200, corsHeaders(request));
}

async function handleVisits(request, url, env) {
  const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);
  const rows = await env.DB.prepare(
    "SELECT session_id, visitor_id, started_at, last_activity_at, ended_at, duration_seconds, entry_path, exit_path, referrer, country " +
    "FROM sessions ORDER BY started_at DESC LIMIT ?"
  ).bind(limit).all();

  return jsonResponse({ visits: rows.results || [] }, 200, corsHeaders(request));
}

async function handlePages(request, url, env) {
  const limit = clampInt(url.searchParams.get("limit"), 25, 1, 100);
  const rows = await env.DB.prepare(
    "SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS unique_visitors " +
    "FROM events WHERE event_type = 'page_view' AND path IS NOT NULL AND path != '' " +
    "GROUP BY path ORDER BY views DESC LIMIT ?"
  ).bind(limit).all();

  return jsonResponse({ pages: rows.results || [] }, 200, corsHeaders(request));
}

async function withAuth(request, env, handler) {
  const ok = await isAuthenticated(request, env);
  if (!ok) {
    if ((request.headers.get("accept") || "").includes("text/html")) {
      return htmlResponse(renderLoginHtml());
    }

    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders(request));
  }

  return handler();
}

async function isAuthenticated(request, env) {
  const authSecret = env.COOKIE_SECRET || "adminh";
  const cookieName = env.COOKIE_NAME || "visitor_analytics_admin";
  const cookies = parseCookies(request.headers.get("cookie") || "");
  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const raw = bearer || cookies[cookieName];
  if (!raw) return false;

  const parts = raw.split(".");
  if (parts.length !== 2) return false;

  const expiresAt = Number(parts[0]);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = await signValue(String(expiresAt), authSecret);
  return expected === parts[1];
}

function validateTrackPayload(payload) {
  const required = ["event_id", "event_type", "visitor_id", "session_id", "path", "timestamp_client"];
  for (const field of required) {
    if (!payload || typeof payload[field] !== "string" || payload[field].trim() === "") {
      return { ok: false, error: `Missing field: ${field}` };
    }
  }

  if (!["session_start", "heartbeat", "page_view", "session_end"].includes(payload.event_type)) {
    return { ok: false, error: "Unsupported event_type" };
  }

  return { ok: true };
}

function cleanText(value) {
  return typeof value === "string" ? value.slice(0, 1000) : null;
}

function normalizeIso(value) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function intOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : null;
}

function clampInt(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

async function hashIp(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "";
  if (!ip || !env.IP_SALT) {
    return null;
  }

  return signValue(ip, env.IP_SALT);
}

async function signValue(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64Url(signature);
}

function base64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parseCookies(value) {
  const result = {};
  for (const part of value.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (!name) continue;
    result[name] = rest.join("=");
  }
  return result;
}

function serializeCookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

async function singleValue(env, sql) {
  const row = await env.DB.prepare(sql).first();
  return row && row.value ? row.value : 0;
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin"
  };
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

function htmlResponse(html, status = 200, extraHeaders = {}) {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...extraHeaders
    }
  });
}

function renderLoginHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Visitor Analytics Login</title></head><body><p>Open the GitHub Pages admin page instead.</p></body></html>`;
}

function renderDashboardHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Visitor Analytics Dashboard</title></head><body><p>Open the GitHub Pages admin page instead.</p></body></html>`;
}
