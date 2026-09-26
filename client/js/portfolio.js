const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

async function loadPortfolio() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            const container = document.querySelector(".container");
            if (container) {
                container.innerHTML = `
                    <div class="profile-card" style="padding: 60px 20px;">
                        <h2>No Portfolio Found</h2>
                        <p>You have not created a portfolio yet. Start building one now!</p>
                        <a href="form.html?mode=create" class="btn btn-primary" style="margin-top: 20px;">+ Create Your Portfolio</a>
                    </div>
                `;
            }
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to load portfolio.");
            return;
        }

        // Profile Header
        document.getElementById("name").innerText = data.fullName || "Your Name";
        document.getElementById("headline").innerText = data.headline || "";
        document.getElementById("tagline").innerText = data.tagline ? `"${data.tagline}"` : "";
        document.getElementById("bio").innerText = data.about || "No introduction provided.";

        if (data.profilePic) {
            const profileImg = document.getElementById("profileImage");
            if (profileImg) profileImg.src = data.profilePic;
        }

        // Contact
        document.getElementById("email").innerText = data.email || "Not Provided";
        document.getElementById("contact").innerText = data.contact || "Not Provided";

        // Skills (render as tags)
        renderSkillTags("softSkills", data.softSkills);
        renderSkillTags("techSkills", data.techSkills);

        // Education
        const eduContainer = document.getElementById("educationContainer");
        if (eduContainer) {
            eduContainer.innerHTML = "";
            if (data.education && Array.isArray(data.education) && data.education.length > 0) {
                data.education.forEach(ed => {
                    const item = document.createElement("div");
                    item.className = "timeline-item";
                    item.innerHTML = `
                        <h3>${escapeHtml(ed.institution || "Institution")}</h3>
                        <h4>${escapeHtml(ed.degree || "Degree")}</h4>
                    `;
                    eduContainer.appendChild(item);
                });
            } else {
                eduContainer.innerHTML = `<p style="color:#666; font-style:italic;">No education details provided.</p>`;
            }
        }

        // Experience
        const expContainer = document.getElementById("experienceContainer");
        if (expContainer) {
            expContainer.innerHTML = "";
            if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
                data.experience.forEach(exp => {
                    const item = document.createElement("div");
                    item.className = "timeline-item";
                    item.innerHTML = `
                        <h3>${escapeHtml(exp.company || "Company")}</h3>
                        <h4>${escapeHtml(exp.duration || "")}</h4>
                        <p>${escapeHtml(exp.responsibilities || "")}</p>
                    `;
                    expContainer.appendChild(item);
                });
            } else {
                expContainer.innerHTML = `<p style="color:#666; font-style:italic;">No work experience provided.</p>`;
            }
        }

        // Projects
        const projectsEl = document.getElementById("projects");
        if (projectsEl) {
            projectsEl.innerText = data.projects || "No projects listed.";
        }

        // Live Template link
        const templateLink = document.getElementById("viewLiveTemplateBtn");
        if (templateLink) {
            const template = data.template || "corporate";
            templateLink.href = `../templates/${template}.html`;
            templateLink.title = `View in ${template.toUpperCase()} template`;
        }

    } catch (error) {
        console.error("Portfolio loading error:", error);
        alert("Failed to connect to the server.");
    }
}

function renderSkillTags(elementId, skillsString) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = "";

    if (!skillsString) {
        el.innerHTML = `<span style="color:#666; font-style:italic;">None specified</span>`;
        return;
    }

    const skills = skillsString.split(",").map(s => s.trim()).filter(Boolean);
    skills.forEach(skill => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.innerText = skill;
        el.appendChild(tag);
    });
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Delete Portfolio Handler
const deleteBtn = document.getElementById("deleteBtn");
if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to delete your portfolio?");
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Portfolio deleted successfully.");
                window.location.href = "dashboard.html";
            } else {
                const data = await response.json();
                alert(data.message || "Failed to delete portfolio.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Could not connect to server.");
        }
    });
}

// Logout Handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedTemplate");
        window.location.href = "index.html";
    });
}

loadPortfolio();
