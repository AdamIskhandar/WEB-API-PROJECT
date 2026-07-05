/**
 * api.js
 * Talks to the PHP backend and manages the JWT session.
 *
 * IMPORTANT: This frontend expects to live at  <project-root>/frontend/
 * i.e. as a sibling folder to auth/, query/, search/, qr_generate.php.
 * If you place it elsewhere, change API_BASE below.
 */
const API_BASE = "..";

const Auth = {
  TOKEN_KEY: "ems_token",

  saveToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getToken() && !this.isExpired();
  },

  /** Decode the JWT payload (no verification — display/routing only). */
  decode() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadPart = token.split(".")[1];
      const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(normalized)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  },

  isExpired() {
    const payload = this.decode();
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  },

  currentUser() {
    const payload = this.decode();
    return payload ? payload.data : null;
  },

  logout() {
    this.clear();
    window.location.href = "index.html";
  },
};

/**
 * Generic request helper.
 * @param {string} path - e.g. "/query/courses.php?id=1"
 * @param {object} opts - { method, body, auth }
 */
async function apiRequest(path, opts = {}) {
  const { method = "GET", body, auth = true } = opts;

  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = Auth.getToken();
    if (!token || Auth.isExpired()) {
      Auth.clear();
      window.location.href = "index.html?expired=1";
      throw new Error("Not authenticated");
    }
    headers["Authorization"] = "Bearer " + token;
  }

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(
      "Could not reach the server. Is the PHP server running at " +
        API_BASE +
        "?"
    );
  }

  // Some backend endpoints (403/401) still return JSON, so try to parse
  // regardless of status, but guard against empty/non-JSON bodies.
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(
        `Server returned a non-JSON response (HTTP ${res.status}). Raw: ${text.slice(
          0,
          200
        )}`
      );
    }
  }

  if (res.status === 401 || res.status === 403) {
    if (data && data.message === "No token provided") {
      Auth.clear();
      window.location.href = "index.html?expired=1";
    }
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/** Build a query string from a plain object, skipping empty values. */
function qs(params = {}) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? "?" + parts.join("&") : "";
}

const Api = {
  login: (email, password) =>
    apiRequest("/auth/login.php", { method: "POST", auth: false, body: { email, password } }),

  register: ({ Name, Email, Password, Role, FacultyID }) =>
    apiRequest("/auth/register.php", {
      method: "POST",
      auth: false,
      body: { Name, Email, Password, Role, FacultyID },
    }),

  // Generic resource helpers keyed by endpoint path
  list: (endpoint, filters) => apiRequest(endpoint + qs(filters)),
  create: (endpoint, body) => apiRequest(endpoint, { method: "POST", body }),
  update: (endpoint, body) => apiRequest(endpoint, { method: "PUT", body }),
  remove: (endpoint, body) => apiRequest(endpoint, { method: "DELETE", body }),

  search: (q, module = "all", limit = 10) =>
    apiRequest("/search/search.php" + qs({ q, module, limit })),

  generateQr: ({ examId, studentId, course, date }) =>
    apiRequest("/qr_generate.php", {
      method: "POST",
      body: { examId, studentId, course, date },
    }),
};
