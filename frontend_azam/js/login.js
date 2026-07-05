// If already logged in, skip straight to the dashboard.
if (Auth.isLoggedIn()) {
  window.location.href = "dashboard.html";
}

const params = new URLSearchParams(window.location.search);
if (params.get("expired") === "1") {
  const hint = document.getElementById("login-hint");
  hint.textContent = "Your session expired. Please sign in again.";
  hint.classList.add("hint--warn");
}
if (params.get("registered") === "1") {
  const hint = document.getElementById("login-hint");
  hint.textContent = "Account created — sign in to continue.";
  hint.classList.add("hint--success");
}

const form = document.getElementById("login-form");
const btn = document.getElementById("login-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  btn.disabled = true;
  btn.textContent = "Signing in…";
  clearError();

  try {
    const res = await Api.login(email, password);
    if (!res.token) throw new Error(res.message || "Login failed.");
    Auth.saveToken(res.token);
    window.location.href = "dashboard.html";
  } catch (err) {
    showError(err.message || "Could not sign in.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign in";
  }
});

function showError(msg) {
  clearError();
  const box = document.createElement("p");
  box.className = "form-error";
  box.id = "form-error";
  box.textContent = msg;
  form.insertBefore(box, form.querySelector(".btn"));
}
function clearError() {
  const existing = document.getElementById("form-error");
  if (existing) existing.remove();
}
