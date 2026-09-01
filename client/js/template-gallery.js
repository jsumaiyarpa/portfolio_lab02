const cards = document.querySelectorAll(".template-card");

let selectedTemplate = "";

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        cards.forEach(c=>c.classList.remove("selected"));

        card.classList.add("selected");

        selectedTemplate = card.dataset.template;

    });

});

document.getElementById("generateBtn").addEventListener("click", () => {

    if (!selectedTemplate) {

        alert("Please select a template.");
        return;

    }

    localStorage.setItem("selectedTemplate", selectedTemplate);

    window.location.href = "../templates/" + selectedTemplate + ".html";

});