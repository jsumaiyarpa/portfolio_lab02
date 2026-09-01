const token = localStorage.getItem("token");

async function loadPortfolio() {

    try {

        const response = await fetch("http://localhost:5000/api/portfolio", {

            method: "GET",

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);
            return;

        }

        // Hero

        document.getElementById("fullName").innerText =
            data.fullName || "";

        document.getElementById("headline").innerText =
            data.headline || "";

        document.getElementById("tagline").innerText =
            data.tagline || "";

        // About

        document.getElementById("aboutText").innerText =
            data.about || "";

        // Skills

        document.getElementById("softSkills").innerText =
            data.softSkills || "";

        document.getElementById("techSkills").innerText =
            data.techSkills || "";

        // Education

        document.getElementById("institution").innerText =
            data.institution || "Not Provided";

        document.getElementById("degree").innerText =
            data.degree || "";

        // Experience

        document.getElementById("company").innerText =
            data.company || "No Experience";

        document.getElementById("duration").innerText =
            data.duration || "";

        document.getElementById("responsibilities").innerText =
            data.responsibilities || "";

        // Projects

        document.getElementById("projectsText").innerText =
            data.projects || "No Projects Added";

        // Contact

        document.getElementById("email").innerText =
            data.email || "Not Provided";

        document.getElementById("contactNumber").innerText =
            data.contact || "Not Provided";

    }

    catch (error) {

        console.log(error);

        alert("Failed to load portfolio.");

    }

}

loadPortfolio();