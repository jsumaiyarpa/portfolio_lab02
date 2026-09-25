document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("portfolioForm");

    if (!form) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    // Check whether this is Create or Edit mode
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const isEdit = mode === "edit";

    let currentTemplate = "corporate";
    let profilePicBase64 = "";

    // DOM Elements
    const educationList = document.getElementById("educationList");
    const experienceList = document.getElementById("experienceList");
    const addEducationBtn = document.getElementById("addEducationBtn");
    const addExperienceBtn = document.getElementById("addExperienceBtn");
    const profilePicInput = document.getElementById("profilePic");
    const profilePicPreview = document.getElementById("profilePicPreview");
    const submitBtn = document.getElementById("submitBtn");
    const formPageTitle = document.getElementById("formPageTitle");

    if (isEdit) {
        if (formPageTitle) formPageTitle.innerText = "Edit Your Professional Portfolio";
        if (submitBtn) submitBtn.innerText = "Update Portfolio";
    }

    // ================= PROFILE PICTURE HANDLER =================
    if (profilePicInput) {
        profilePicInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 300 * 1024) {
                alert("Image is too large. Please select an image under 300KB.");
                profilePicInput.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                profilePicBase64 = event.target.result;
                if (profilePicPreview) {
                    profilePicPreview.src = profilePicBase64;
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // ================= DYNAMIC EDUCATION REPEATER =================
    function addEducationEntry(institution = "", degree = "") {
        const entry = document.createElement("div");
        entry.className = "repeater-entry education-entry";

        entry.innerHTML = `
            <div class="entry-header">
                <span class="entry-title">Education Entry</span>
                <button type="button" class="remove-entry-btn">Remove</button>
            </div>
            <label>Institution</label>
            <input type="text" name="institution" placeholder="University, College, or School name" value="${escapeHtml(institution)}">
            <label>Degree</label>
            <input type="text" name="degree" placeholder="e.g. Bachelor of Science in Computer Science" value="${escapeHtml(degree)}">
        `;

        entry.querySelector(".remove-entry-btn").addEventListener("click", () => {
            entry.remove();
        });

        educationList.appendChild(entry);
    }

    if (addEducationBtn) {
        addEducationBtn.addEventListener("click", () => {
            addEducationEntry();
        });
    }

    // ================= DYNAMIC EXPERIENCE REPEATER =================
    function addExperienceEntry(company = "", duration = "", responsibilities = "") {
        const entry = document.createElement("div");
        entry.className = "repeater-entry experience-entry";

        entry.innerHTML = `
            <div class="entry-header">
                <span class="entry-title">Experience Entry</span>
                <button type="button" class="remove-entry-btn">Remove</button>
            </div>
            <label>Company Name</label>
            <input type="text" name="company" placeholder="Company or Organization" value="${escapeHtml(company)}">
            <label>Duration</label>
            <input type="text" name="duration" placeholder="e.g. Jan 2022 - Present" value="${escapeHtml(duration)}">
            <label>Responsibilities</label>
<textarea name="responsibilities" placeholder="Describe your key roles and accomplishments..." maxlength="100">${escapeHtml(responsibilities)}</textarea>
        `;
        entry.querySelector(".remove-entry-btn").addEventListener("click", () => {
            entry.remove();
        });

        experienceList.appendChild(entry);
    }

    if (addExperienceBtn) {
        addExperienceBtn.addEventListener("click", () => {
            addExperienceEntry();
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

    // ================= LOAD EXISTING PORTFOLIO =================
    async function loadExistingPortfolio() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // If 404 and creating new, start with 1 blank entry each
                addEducationEntry();
                addExperienceEntry();
                return;
            }

            const data = await response.json();

            // Personal Information
            document.getElementById("fullName").value = data.fullName || "";
            document.getElementById("headline").value = data.headline || "";
            document.getElementById("tagline").value = data.tagline || "";
            document.getElementById("email").value = data.email || "";
            document.getElementById("contact").value = data.contact || "";

            // Profile Picture
            if (data.profilePic) {
                profilePicBase64 = data.profilePic;
                if (profilePicPreview) profilePicPreview.src = data.profilePic;
            }

            // About
            document.getElementById("about").value = data.about || "";

            // Skills
            document.getElementById("softSkills").value = data.softSkills || "";
            document.getElementById("techSkills").value = data.techSkills || "";

            // Template
            currentTemplate = data.template || "corporate";

            // Education
            if (data.education && Array.isArray(data.education) && data.education.length > 0) {
                educationList.innerHTML = "";
                data.education.forEach(ed => {
                    addEducationEntry(ed.institution || "", ed.degree || "");
                });
            } else {
                addEducationEntry();
            }

            // Experience
            if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
                experienceList.innerHTML = "";
                data.experience.forEach(exp => {
                    addExperienceEntry(exp.company || "", exp.duration || "", exp.responsibilities || "");
                });
            } else {
                addExperienceEntry();
            }

            // Projects
            document.getElementById("projects").value = data.projects || "";

        } catch (error) {
            console.error("Load portfolio error:", error);
            addEducationEntry();
            addExperienceEntry();
        }
    }

    // ================= SUBMIT FORM =================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Education Array
        const education = [];
        const eduEntries = document.querySelectorAll(".education-entry");
        eduEntries.forEach(entry => {
            const inst = entry.querySelector('input[name="institution"]')?.value.trim() || "";
            const deg = entry.querySelector('input[name="degree"]')?.value.trim() || "";
            if (inst || deg) {
                education.push({ institution: inst, degree: deg });
            }
        });

        // Experience Array
        const experience = [];
        const expEntries = document.querySelectorAll(".experience-entry");
        expEntries.forEach(entry => {
            const comp = entry.querySelector('input[name="company"]')?.value.trim() || "";
            const dur = entry.querySelector('input[name="duration"]')?.value.trim() || "";
            const resp = entry.querySelector('textarea[name="responsibilities"]')?.value.trim() || "";
            if (comp || dur || resp) {
                experience.push({ company: comp, duration: dur, responsibilities: resp });
            }
        });

        // Portfolio Payload
        const portfolioData = {
            fullName: document.getElementById("fullName").value.trim(),
            headline: document.getElementById("headline").value.trim(),
            tagline: document.getElementById("tagline").value.trim(),
            about: document.getElementById("about").value.trim(),
            email: document.getElementById("email").value.trim(),
            contact: document.getElementById("contact").value.trim(),
            profilePic: profilePicBase64,
            softSkills: document.getElementById("softSkills").value.trim(),
            techSkills: document.getElementById("techSkills").value.trim(),
            education,
            experience,
            projects: document.getElementById("projects").value.trim(),
            template: currentTemplate
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
                method: "POST", // Server handles upsert
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(portfolioData)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to save portfolio.");
                return;
            }

            alert(isEdit ? "Portfolio Updated Successfully!" : "Portfolio Created Successfully!");
            window.location.href = "portfolio.html";

        } catch (error) {
            console.error("Submission error:", error);
            alert("Could not connect to the server.");
        }
    });

    // Logout Handler
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("selectedTemplate");
            window.location.href = "index.html";
        });
    }

    // Initialize
    loadExistingPortfolio();
});