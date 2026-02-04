// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");

      window.location.href = "./index.html";
      return;
    }

    // Clear Auth
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    window.location.href = "./index.html";

    // Reset UI
    document.getElementById("loginModal").style.display = "flex";
    document.getElementById("app").style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Logout failed");
  }
});