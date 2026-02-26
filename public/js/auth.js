async function handleLogout() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch("/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            throw new Error("Logout failed");
        }

        //Clear Auth data
        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        //Reload page or redirect to login
        location.reload();
    } catch (err) {
        console.error("Logout error:", err);
        alert("Failed to logout");
    }
}