const token = localStorage.getItem("token");

async function loadPortfolio() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const publicId = urlParams.get("id");

        let response;
        if (publicId) {
            response = await fetch(`${API_BASE_URL}/api/portfolio/public/${publicId}`);
        } else if (token) {
            response = await fetch(`${API_BASE_URL}/api/portfolio`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } else {
            alert("Please login to view your portfolio or provide a public link.");
            window.location.href = "../html/index.html";
            return;
        }

        if (!response.ok) {
            const data = await response.json();
            alert(data.message || "Failed to load portfolio.");
            return;
        }

        const data = await response.json();

        // Hero
        document.getElementById("fullName").innerText = data.fullName || "Your Name";
        document.getElementById("headline").innerText = data.headline || "Full Stack Developer";
        document.getElementById("tagline").innerText = data.tagline ? `"${data.tagline}"` : "";

        // Profile Image
        if (data.profilePic) {
            document.getElementById("profileImage").src = data.profilePic;
        }

        // About
        document.getElementById("aboutText").innerText = data.about || "No introduction provided.";

        // Skills (Soft & Technical)
        renderTags("softSkills", data.softSkills);
        renderTags("techSkills", data.techSkills);

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
                eduContainer.innerHTML = `<p style="color: #94a3b8;">No education history provided.</p>`;
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
                expContainer.innerHTML = `<p style="color: #94a3b8;">No experience records listed.</p>`;
            }
        }

        // Projects
        const projectsEl = document.getElementById("projectsText");
        if (projectsEl) {
            projectsEl.innerText = data.projects || "No projects listed.";
        }

        // Contact
        document.getElementById("email").innerText = data.email || "Not Provided";
        document.getElementById("contactNumber").innerText = data.contact || "Not Provided";

    } catch (error) {
        console.error("Dark portfolio load error:", error);
        alert("Failed to load portfolio.");
    }
}

function renderTags(elementId, skillsString) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = "";

    if (!skillsString) {
        el.innerHTML = `<span style="color:#64748b; font-style:italic;">None specified</span>`;
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

loadPortfolio();
