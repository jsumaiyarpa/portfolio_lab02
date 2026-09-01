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


    // ================= LOAD EXISTING PORTFOLIO FOR EDIT =================

    async function loadExistingPortfolio() {

        if (!isEdit) {
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/portfolio",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Could not load portfolio.");
                return;
            }

            // Personal Information
            document.getElementById("fullName").value =
                data.fullName || "";

            document.getElementById("headline").value =
                data.headline || "";

            document.getElementById("tagline").value =
                data.tagline || "";

            document.getElementById("email").value =
                data.email || "";

            document.getElementById("contact").value =
                data.contact || "";


            // About
            document.getElementById("about").value =
                data.about || "";


            // Skills
            document.getElementById("softSkills").value =
                data.softSkills || "";

            document.getElementById("techSkills").value =
                data.techSkills || "";


            // Education
            if (data.education && data.education.length > 0) {

                const firstEducation = data.education[0];

                document.getElementById("institution").value =
                    firstEducation.institution || "";

                document.getElementById("degree").value =
                    firstEducation.degree || "";
            }


            // Experience
            if (data.experience && data.experience.length > 0) {

                const firstExperience = data.experience[0];

                document.getElementById("company").value =
                    firstExperience.company || "";

                document.getElementById("duration").value =
                    firstExperience.duration || "";

                document.getElementById("responsibilities").value =
                    firstExperience.responsibilities || "";
            }


            // Projects
            document.getElementById("projects").value =
                data.projects || "";


        } catch (error) {

            console.error(error);

            alert("Failed to load portfolio.");

        }
    }


    // ================= SUBMIT FORM =================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();


        // ================= EDUCATION =================

        const education = [];

        const institutionInputs =
            document.querySelectorAll('input[name="institution"]');

        const degreeInputs =
            document.querySelectorAll('input[name="degree"]');

        for (let i = 0; i < institutionInputs.length; i++) {

            const institution =
                institutionInputs[i].value.trim();

            const degree =
                degreeInputs[i]
                    ? degreeInputs[i].value.trim()
                    : "";

            if (institution || degree) {

                education.push({
                    institution,
                    degree
                });

            }
        }


        // ================= EXPERIENCE =================

        const experience = [];

        const companyInputs =
            document.querySelectorAll('input[name="company"]');

        const durationInputs =
            document.querySelectorAll('input[name="duration"]');

        const responsibilityInputs =
            document.querySelectorAll(
                'textarea[name="responsibilities"]'
            );

        for (let i = 0; i < companyInputs.length; i++) {

            const company =
                companyInputs[i].value.trim();

            const duration =
                durationInputs[i]
                    ? durationInputs[i].value.trim()
                    : "";

            const responsibilities =
                responsibilityInputs[i]
                    ? responsibilityInputs[i].value.trim()
                    : "";

            if (
                company ||
                duration ||
                responsibilities
            ) {

                experience.push({
                    company,
                    duration,
                    responsibilities
                });

            }
        }


        // ================= PROJECTS =================

        const projectInputs =
            document.querySelectorAll(
                'textarea[name="projects"]'
            );

        const projects = [];

        projectInputs.forEach(input => {

            const value = input.value.trim();

            if (value) {
                projects.push(value);
            }

        });


        // Convert projects array into one text value
        const projectText = projects.join("\n\n");


        // ================= PORTFOLIO DATA =================

        const portfolioData = {

            fullName:
                document.getElementById("fullName").value.trim(),

            headline:
                document.getElementById("headline").value.trim(),

            tagline:
                document.getElementById("tagline").value.trim(),

            about:
                document.getElementById("about").value.trim(),

            email:
                document.getElementById("email").value.trim(),

            contact:
                document.getElementById("contact").value.trim(),

            softSkills:
                document.getElementById("softSkills").value.trim(),

            techSkills:
                document.getElementById("techSkills").value.trim(),

            education,

            experience,

            projects: projectText,

            template: "corporate"
        };


        // ================= CREATE / UPDATE =================

        try {

            const url =
                "http://localhost:5000/api/portfolio";

            const method =
                isEdit ? "PUT" : "POST";


            const response = await fetch(url, {

                method,

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify(portfolioData)

            });


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Something went wrong."
                );

                return;
            }


            if (isEdit) {

                alert(
                    "Portfolio Updated Successfully!"
                );

            } else {

                alert(
                    "Portfolio Created Successfully!"
                );

            }


            // Go to portfolio preview
            window.location.href = "portfolio.html";


        } catch (error) {

            console.error(error);

            alert(
                "Could not connect to the server."
            );

        }

    });


    // Load data if editing
    loadExistingPortfolio();

});