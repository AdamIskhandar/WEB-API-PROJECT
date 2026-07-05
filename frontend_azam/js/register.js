if (Auth.isLoggedIn()) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("register-form");
const btn = document.getElementById("register-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const Name = document.getElementById("name").value.trim();
  const Email = document.getElementById("email").value.trim();
  const Password = document.getElementById("password").value;
  const Role = document.getElementById("role").value;
  const facultyRaw = document.getElementById("faculty").value;
  const FacultyID = facultyRaw ? Number(facultyRaw) : null;

  btn.disabled = true;
  btn.textContent = "Creating account…";
  clearError();

  try {
    const res = await Api.register({ Name, Email, Password, Role, FacultyID });
    if (res.message && res.message.toLowerCase().includes("fail")) {
      throw new Error(res.message);
    }
    window.location.href = "index.html?registered=1";
  } catch (err) {
    showError(err.message || "Could not create your account.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create account";
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
