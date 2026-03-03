console.log("login.js is connected");

async function handleLogin() {
  const name = document.getElementById("name").value.trim().toLowerCase();
  const pin = document.getElementById("pin").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin }),
    });

    if (!res.ok) {
      const data = await res.json();
      document.getElementById("loginError").innerText =
        data.error || "Login failed.";
      return;
    }

    const { user, token } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("userName", user.name);

    // Hide Modal
    document.getElementById("loginModal").style.display = "none";

    // Show logged in user
    document.getElementById("currentUser").innerText =
      `Logged in: ${user.name}`;
  } catch (err) {
    console.error(err);
    document.getElementById("loginError").innerText = "Server error";
  }
};

// Logout functionality
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        // Clear auth regardless
        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        window.location.href = "./index.html";

      } catch (err) {
        console.error(err);
        alert("Logout failed");
      }
    });
  }

  const logoutOkBtn = document.getElementById("logoutOkBtn");
  if (logoutOkBtn) {
    logoutOkBtn.addEventListener("click", () => {
      document.getElementById("logoutModal")?.classList.add("hidden");
      window.location.href = "./index.html";
    });
  }
});

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", handleLogin);
}