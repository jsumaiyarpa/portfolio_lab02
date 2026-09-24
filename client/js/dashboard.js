const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const user = JSON.parse(localStorage.getItem("user") || "null");

if (user && user.name) {
    const welcomeEl = document.getElementById("welcomeText");
    if (welcomeEl) {
        welcomeEl.innerText = `Welcome back, ${user.name} 👋`;
    }
}

// Navigation Actions
const createBtn = document.getElementById("createPortfolio");
if (createBtn) {
    createBtn.onclick = () => {
        window.location.href = "form.html?mode=create";
    };
}

const editBtn = document.getElementById("editPortfolio");
if (editBtn) {
    editBtn.onclick = () => {
        window.location.href = "form.html?mode=edit";
    };
}

const previewBtn = document.getElementById("previewPortfolio");
if (previewBtn) {
    previewBtn.onclick = () => {
        window.location.href = "portfolio.html";
    };
}

const templateBtn = document.getElementById("templateGallery");
if (templateBtn) {
    templateBtn.onclick = () => {
        window.location.href = "template-gallery.html";
    };
}

const profileBtn = document.getElementById("profileSettings");
if (profileBtn) {
    profileBtn.onclick = () => {
        window.location.href = "profile.html";
    };
}

// ================= EXPORT AS LINK REAL HANDLER =================
const exportLinkBtn = document.getElementById("exportLinkBtn");
if (exportLinkBtn) {
    exportLinkBtn.onclick = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/portfolio/publish`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                showToast("Create your portfolio before exporting a link.", "error");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message || "Failed to generate portfolio link.", "error");
                return;
            }

            // Construct public URL dynamically based on environment
            const publicUrl = `${API_BASE_URL}/p/${data.publicId}`;

            // Copy to clipboard
            let copied = false;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(publicUrl);
                    copied = true;
                } catch (clipErr) {
                    console.warn("Clipboard API write failed, using fallback:", clipErr);
                }
            }
            
            if (!copied) {
                const tempInput = document.createElement("textarea");
                tempInput.value = publicUrl;
                tempInput.style.position = "fixed";
                tempInput.style.opacity = "0";
                document.body.appendChild(tempInput);
                tempInput.focus();
                tempInput.select();
                try {
                    document.execCommand("copy");
                    copied = true;
                } catch (e) {
                    console.error("Fallback copy failed:", e);
                }
                document.body.removeChild(tempInput);
            }

            // Update button visual feedback temporarily
            const originalHTML = exportLinkBtn.innerHTML;
            exportLinkBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Link Copied!
            `;
            setTimeout(() => {
                exportLinkBtn.innerHTML = originalHTML;
            }, 2500);

            // Show professional toast notification
            showToast("Portfolio link copied to clipboard!");

        } catch (error) {
            console.error("Export link error:", error);
            showToast("Could not connect to server to export portfolio link.", "error");
        }
    };
}

// Toast notification helper
function showToast(message, type = "success") {
    let toast = document.getElementById("dashboardToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "dashboardToast";
        toast.className = "app-toast";
        document.body.appendChild(toast);
    }

    toast.className = `app-toast ${type === "error" ? "error" : "success"} show`;
    toast.innerText = message;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

// Delete Portfolio Handler
const deleteBtn = document.getElementById("deletePortfolioCard");
if (deleteBtn) {
    deleteBtn.onclick = async () => {
        const confirmed = confirm("Are you sure you want to delete your portfolio? This action cannot be undone.");
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert("Portfolio deleted successfully.");
            } else {
                alert(data.message || "Failed to delete portfolio.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Could not connect to server to delete portfolio.");
        }
    };
}

// Logout Handler
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedTemplate");
    window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.onclick = logout;

const logoutCard = document.getElementById("logoutCard");
if (logoutCard) logoutCard.onclick = logout;