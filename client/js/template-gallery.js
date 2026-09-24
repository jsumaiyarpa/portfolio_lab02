const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const cards = document.querySelectorAll(".template-card");
let selectedTemplate = localStorage.getItem("selectedTemplate") || "corporate";

// Load user's saved template from server
async function loadSavedTemplate() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.template) {
                selectedTemplate = data.template;
            }
        }
    } catch (e) {
        console.error("Could not fetch saved template:", e);
    }

    // Highlight the selected card
    cards.forEach(card => {
        if (card.dataset.template === selectedTemplate) {
            card.classList.add("selected");
        } else {
            card.classList.remove("selected");
        }
    });
}

cards.forEach(card => {
    card.addEventListener("click", () => {
        cards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedTemplate = card.dataset.template;
    });
});

document.getElementById("generateBtn").addEventListener("click", async () => {
    if (!selectedTemplate) {
        alert("Please select a template.");
        return;
    }

    localStorage.setItem("selectedTemplate", selectedTemplate);

    // Persist choice to database
    try {
        await fetch(`${API_BASE_URL}/api/portfolio`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ template: selectedTemplate })
        });
    } catch (err) {
        console.warn("Could not persist template to DB:", err);
    }

    window.location.href = `../templates/${selectedTemplate}.html`;
});

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

loadSavedTemplate();