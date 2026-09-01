const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

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

        document.getElementById("name").innerText = data.fullName;
        document.getElementById("bio").innerText = data.bio;

        document.getElementById("email").innerText = data.email;
        document.getElementById("contact").innerText = data.contact;

        document.getElementById("softSkills").innerText = data.softSkills;
        document.getElementById("techSkills").innerText = data.techSkills;

        document.getElementById("institution").innerText = data.institution || "N/A";
        document.getElementById("degree").innerText = data.degree || "N/A";

        document.getElementById("company").innerText = data.company || "N/A";
        document.getElementById("duration").innerText = data.duration || "";
        document.getElementById("responsibilities").innerText = data.responsibilities || "";

        document.getElementById("projects").innerText = data.projects || "N/A";

    } catch (error) {

        console.log(error);

        alert("Failed to load portfolio.");

    }

}

loadPortfolio();

document.getElementById("logoutBtn").addEventListener("click", function () {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";

});