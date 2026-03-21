---
permalink: /admin/
title: "Admin"
layout: single
author_profile: false
analytics: false
---

{% assign admin_api_base = site.visitor_analytics.admin_api_base | default: "" %}

<style>
.admin-shell {
  max-width: 1080px;
  margin: 0 auto;
  padding: 8px 0 32px;
}

.admin-hero {
  margin-bottom: 18px;
  padding: 22px 24px;
  border: 1px solid rgba(24, 50, 74, 0.12);
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(47, 106, 143, 0.14), transparent 32%),
    radial-gradient(circle at bottom right, rgba(196, 150, 84, 0.18), transparent 24%),
    linear-gradient(180deg, #f9f6f0, #f1e7d8);
  box-shadow: 0 18px 40px rgba(24, 50, 74, 0.08);
}

.admin-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
}

.admin-hero p {
  margin: 8px 0 0;
  color: #4f677b;
}

.admin-card,
.admin-metric,
.admin-panel {
  border: 1px solid rgba(24, 50, 74, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 34px rgba(24, 50, 74, 0.07);
}

.admin-card {
  max-width: 460px;
  padding: 22px;
}

.admin-form-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.admin-input,
.admin-button {
  font: inherit;
  border-radius: 12px;
  padding: 12px 14px;
}

.admin-input {
  flex: 1 1 auto;
  border: 1px solid #c5d2dd;
  min-width: 0;
}

.admin-button {
  border: none;
  background: #18324a;
  color: #fff;
  cursor: pointer;
}

.admin-button.secondary {
  background: #5c7387;
}

.admin-error {
  min-height: 1.4em;
  margin-top: 10px;
  color: #922222;
}

.admin-dashboard[hidden],
.admin-login[hidden] {
  display: none;
}

.admin-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.admin-metric {
  padding: 16px 18px;
}

.admin-metric-label {
  color: #536a7c;
  font-size: 0.95rem;
}

.admin-metric-value {
  margin-top: 10px;
  font-size: 2rem;
  color: #18324a;
}

.admin-panels {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
}

.admin-panel {
  padding: 18px;
}

.admin-panel h2 {
  margin-top: 0;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  text-align: left;
  padding: 10px 0;
  border-bottom: 1px solid rgba(24, 50, 74, 0.1);
  vertical-align: top;
}

.admin-muted {
  color: #60778a;
  word-break: break-word;
}

@media (max-width: 900px) {
  .admin-form-row {
    flex-direction: column;
  }

  .admin-panels {
    grid-template-columns: 1fr;
  }
}
</style>

<div class="admin-shell">
  <section class="admin-hero">
    <h1>Visitor Analytics Admin</h1>
    <p>Private reporting for unique visitors, recent sessions, and page activity.</p>
  </section>

  <section id="admin-login" class="admin-login">
    <div class="admin-card">
      <h2>Sign in</h2>
      <p>Enter the admin password to view your analytics dashboard.</p>
      <div class="admin-form-row">
        <input id="admin-password" class="admin-input" type="password" placeholder="Password" autocomplete="current-password">
        <button id="admin-login-button" class="admin-button" type="button">Unlock</button>
      </div>
      <div id="admin-error" class="admin-error"></div>
    </div>
  </section>

  <section id="admin-dashboard" class="admin-dashboard" hidden>
    <div class="admin-actions">
      <button id="admin-logout-button" class="admin-button secondary" type="button">Log out</button>
    </div>

    <div id="admin-metrics" class="admin-grid"></div>

    <div class="admin-panels">
      <section class="admin-panel">
        <h2>Recent visits</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Started</th>
              <th>Duration</th>
              <th>Entry</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody id="admin-recent-visits"></tbody>
        </table>
      </section>

      <section class="admin-panel">
        <h2>Top pages</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Views</th>
              <th>Unique</th>
            </tr>
          </thead>
          <tbody id="admin-top-pages"></tbody>
        </table>
      </section>
    </div>
  </section>
</div>

<script>
(function () {
  const storageKey = "visitor_analytics_admin_token";
  const apiBase = {{ admin_api_base | jsonify }};
  const loginSection = document.getElementById("admin-login");
  const dashboardSection = document.getElementById("admin-dashboard");
  const errorEl = document.getElementById("admin-error");
  const passwordEl = document.getElementById("admin-password");
  const loginButton = document.getElementById("admin-login-button");
  const logoutButton = document.getElementById("admin-logout-button");

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatSeconds(value) {
    const total = Math.max(0, Number(value || 0));
    const minutes = Math.floor(total / 60);
    const seconds = Math.floor(total % 60);
    return minutes + "m " + seconds + "s";
  }

  function setToken(token) {
    try {
      if (token) {
        localStorage.setItem(storageKey, token);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      return;
    }
  }

  function getToken() {
    try {
      return localStorage.getItem(storageKey) || "";
    } catch (error) {
      return "";
    }
  }

  function headers() {
    const token = getToken();
    const result = { accept: "application/json" };
    if (token) {
      result.Authorization = "Bearer " + token;
    }
    return result;
  }

  async function apiFetch(path, options) {
    if (!apiBase) {
      throw new Error("visitor_analytics.admin_api_base is not configured in _config.yml");
    }

    const response = await fetch(apiBase.replace(/\/$/, "") + path, Object.assign({
      headers: headers()
    }, options || {}));

    if (response.status === 401) {
      setToken("");
      showLogin("Please sign in.");
      throw new Error("Unauthorized");
    }

    return response;
  }

  function showLogin(message) {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    if (message) {
      errorEl.textContent = message;
    }
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    errorEl.textContent = "";
  }

  async function login() {
    errorEl.textContent = "";

    const response = await apiFetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({ password: passwordEl.value })
    }).catch(function (error) {
      errorEl.textContent = error.message;
      return null;
    });

    if (!response) return;

    if (!response.ok) {
      errorEl.textContent = "Incorrect password.";
      return;
    }

    const data = await response.json();
    setToken(data.token || "");
    passwordEl.value = "";
    await loadDashboard();
  }

  async function loadDashboard() {
    const response = await apiFetch("/api/stats/summary");
    const data = await response.json();

    const metrics = [
      ["Total unique visitors", data.total_unique_visitors],
      ["Visitors today", data.unique_visitors_today],
      ["Visitors 7d", data.unique_visitors_7d],
      ["Visitors 30d", data.unique_visitors_30d],
      ["Total sessions", data.total_sessions],
      ["Avg. session duration", formatSeconds(data.average_session_duration_seconds)]
    ];

    document.getElementById("admin-metrics").innerHTML = metrics.map(function (item) {
      return '<article class="admin-metric"><div class="admin-metric-label">' + escapeHtml(item[0]) + '</div><div class="admin-metric-value">' + escapeHtml(item[1]) + '</div></article>';
    }).join("");

    document.getElementById("admin-recent-visits").innerHTML = (data.recent_visits || []).map(function (visit) {
      return '<tr><td>' + escapeHtml(visit.started_at) + '</td><td>' + escapeHtml(formatSeconds(visit.duration_seconds)) + '</td><td class="admin-muted">' + escapeHtml(visit.entry_path || "") + '</td><td>' + escapeHtml(visit.country || "-") + '</td></tr>';
    }).join("");

    document.getElementById("admin-top-pages").innerHTML = (data.top_pages || []).map(function (page) {
      return '<tr><td class="admin-muted">' + escapeHtml(page.path || "") + '</td><td>' + escapeHtml(page.views) + '</td><td>' + escapeHtml(page.unique_visitors) + '</td></tr>';
    }).join("");

    showDashboard();
  }

  async function logout() {
    try {
      await apiFetch("/api/logout", { method: "POST" });
    } catch (error) {
      return;
    } finally {
      setToken("");
      showLogin("Signed out.");
    }
  }

  loginButton.addEventListener("click", login);
  passwordEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      login();
    }
  });
  logoutButton.addEventListener("click", logout);

  if (getToken()) {
    loadDashboard().catch(function (error) {
      showLogin(error.message);
    });
  } else {
    showLogin("");
  }
})();
</script>
