const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

// Fetch and display user profile info
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "index.html";
            }
            return;
        }

        const data = await response.json();
        if (data.user) {
            document.getElementById("name").value = data.user.name || "";
            document.getElementById("email").value = data.user.email || "";
        }
    } catch (err) {
        console.error("Failed to load user profile:", err);
    }
}

// Handle Update Profile (Name/Email)
const profileForm = document.getElementById("profileForm");
if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();

        if (!name || !email) {
            alert("Please provide name and email");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
            } else {
                alert(data.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            alert("Could not connect to server.");
        }
    });
}

// Handle Change Password
const passwordForm = document.getElementById("passwordForm");
if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmNewPassword = document.getElementById("confirmNewPassword").value;

        if (newPassword !== confirmNewPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters long.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Password changed successfully!");
                passwordForm.reset();
            } else {
                alert(data.message || "Failed to change password.");
            }
        } catch (err) {
            console.error("Password update error:", err);
            alert("Could not connect to server.");
        }
    });
}

// Handle Delete Account
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
        const confirmed = confirm("WARNING: Are you sure you want to permanently delete your account and all portfolio data? This action CANNOT be undone.");
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/account`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Account deleted successfully.");
                localStorage.clear();
                window.location.href = "index.html";
            } else {
                const data = await response.json();
                alert(data.message || "Failed to delete account.");
            }
        } catch (err) {
            console.error("Delete account error:", err);
            alert("Could not connect to server.");
        }
    });
}

// Logout Handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

loadUserProfile();
