// auth.js - Shared auth & auto-logout for all pages

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
let logoutTimer = null;

// ─── Auto-logout ───────────────────────────────────────────────────────────────

function resetTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(autoLogout, TIMEOUT_MS);
}

async function autoLogout() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return; // already logged out
        await fetch("/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error("Auto-logout error:", err);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        alert("You have been logged out due to inactivity.");
        window.location.href = "/index.html";
    }
}

// Reset timer on any button click in the app
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) return; // don't start timer if not logged in

    // Start the timer
    resetTimer();

    // Reset on any button click
    document.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            resetTimer();
        }
    });
});


// ─── Manual Logout ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
        clearTimeout(logoutTimer); // cancel auto-logout timer
        try {
            const token = localStorage.getItem("token");
            await fetch("/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            window.location.href = "/index.html";
        }
    });
});


// ─── Show logged in user ───────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    const currentUserEl = document.getElementById("currentUser");
    if (currentUserEl) {
        const userName = localStorage.getItem("userName");
        if (userName) currentUserEl.innerText = `Logged in: ${userName}`;
    }
});