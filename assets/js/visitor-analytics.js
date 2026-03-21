(function () {
  const config = window.__VISITOR_ANALYTICS_CONFIG__;

  if (!config || !config.enabled || !config.endpoint || !window.fetch) {
    return;
  }

  const VISITOR_KEY = "visitor_analytics_visitor_id";
  const SESSION_KEY = "visitor_analytics_session";
  const TAB_KEY = "visitor_analytics_tab_id";
  const DEFAULT_HEARTBEAT_MS = 15000;
  const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  let heartbeatTimer = null;
  let ended = false;
  let lastPath = currentPath();

  function currentPath() {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return template.replace(/[xy]/g, function (char) {
      const rand = Math.floor(Math.random() * 16);
      const value = char === "x" ? rand : (rand & 0x3) | 0x8;
      return value.toString(16);
    });
  }

  function readJson(storage, key) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeJson(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return false;
    }

    return true;
  }

  function getVisitorId() {
    try {
      const existing = window.localStorage.getItem(VISITOR_KEY);
      if (existing) return existing;

      const created = uuid();
      window.localStorage.setItem(VISITOR_KEY, created);
      return created;
    } catch (error) {
      return "anon-" + uuid();
    }
  }

  function getTabId() {
    try {
      const existing = window.sessionStorage.getItem(TAB_KEY);
      if (existing) return existing;

      const created = uuid();
      window.sessionStorage.setItem(TAB_KEY, created);
      return created;
    } catch (error) {
      return "tab-" + uuid();
    }
  }

  function getSession() {
    const tabId = getTabId();
    const timeoutMs = Number(config.sessionTimeoutMs) || DEFAULT_SESSION_TIMEOUT_MS;
    const stored = readJson(window.sessionStorage, SESSION_KEY);
    const now = Date.now();

    if (
      stored &&
      stored.session_id &&
      stored.tab_id === tabId &&
      typeof stored.last_activity_at === "number" &&
      now - stored.last_activity_at < timeoutMs
    ) {
      return stored;
    }

    const created = {
      session_id: uuid(),
      tab_id: tabId,
      started_at: now,
      last_activity_at: now
    };
    writeJson(window.sessionStorage, SESSION_KEY, created);
    return created;
  }

  function updateSessionActivity() {
    const session = getSession();
    session.last_activity_at = Date.now();
    writeJson(window.sessionStorage, SESSION_KEY, session);
    return session;
  }

  function buildPayload(eventType, extra) {
    const session = updateSessionActivity();

    return Object.assign(
      {
        event_id: uuid(),
        event_type: eventType,
        visitor_id: getVisitorId(),
        session_id: session.session_id,
        path: currentPath(),
        referrer: document.referrer || "",
        timestamp_client: nowIso(),
        screen: {
          width: window.screen ? window.screen.width : null,
          height: window.screen ? window.screen.height : null
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        language: navigator.language || "",
        page_title: document.title || ""
      },
      extra || {}
    );
  }

  function send(eventType, extra, useBeacon) {
    const payload = buildPayload(eventType, extra);
    const body = JSON.stringify(payload);

    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(config.endpoint, blob);
      return;
    }

    window.fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: eventType === "session_end"
    }).catch(function () {
      return null;
    });
  }

  function trackPageView(reason) {
    const path = currentPath();
    if (path === lastPath && reason !== "initial") {
      return;
    }

    lastPath = path;
    send("page_view", { navigation_reason: reason || "navigation" });
  }

  function flushSessionEnd(reason) {
    if (ended) return;
    ended = true;
    send("session_end", { end_reason: reason || "pagehide" }, true);
  }

  function startHeartbeat() {
    const intervalMs = Number(config.heartbeatIntervalMs) || DEFAULT_HEARTBEAT_MS;

    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer);
    }

    heartbeatTimer = window.setInterval(function () {
      if (document.visibilityState === "visible") {
        send("heartbeat");
      }
    }, intervalMs);
  }

  function installNavigationHooks() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      window.setTimeout(function () {
        trackPageView("pushState");
      }, 0);
      return result;
    };

    history.replaceState = function () {
      const result = originalReplaceState.apply(this, arguments);
      window.setTimeout(function () {
        trackPageView("replaceState");
      }, 0);
      return result;
    };

    window.addEventListener("popstate", function () {
      trackPageView("popstate");
    });

    window.addEventListener("hashchange", function () {
      trackPageView("hashchange");
    });
  }

  send("session_start", { landing_path: currentPath() });
  trackPageView("initial");
  startHeartbeat();
  installNavigationHooks();

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      flushSessionEnd("hidden");
    } else {
      ended = false;
      send("heartbeat", { resume: true });
    }
  });

  window.addEventListener("pagehide", function () {
    flushSessionEnd("pagehide");
  });

  window.addEventListener("beforeunload", function () {
    flushSessionEnd("beforeunload");
  });
})();
