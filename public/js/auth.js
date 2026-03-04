// auth.js - Shared auth utilities for all pages

// Show logged in username in header
document.addEventListener("DOMContentLoaded", () => {
    const currentUserEl = document.getElementById("currentUser");
    if (currentUserEl) {
        const userName = localStorage.getItem("userName");
        if (userName) {
            currentUserEl.innerText = `Logged in: ${userName}`;
        }
    }
});

// Logout button - works on any page that has a #logoutBtn
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
        try {
            const token = localStorage.getItem("token");

            await fetch("/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            // Always clear auth and redirect, even if server call fails
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            window.location.href = "/index.html";
        }
    });
});