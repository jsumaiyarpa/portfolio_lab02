const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "index.html";

}

const user = JSON.parse(localStorage.getItem("user"));

if (user) {

    document.getElementById("welcomeText").innerText =
        `Welcome, ${user.name} 👋`;

}

document.getElementById("createPortfolio").onclick = function () {

    window.location.href = "form.html";

};

document.getElementById("editPortfolio").onclick = function () {

    window.location.href = "form.html";

};

document.getElementById("previewPortfolio").onclick = function () {

    window.location.href = "portfolio.html";

};

document.getElementById("profileSettings").onclick = function () {

    window.location.href = "profile.html";

};

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";

}

document.getElementById("logoutBtn").onclick = logout;

document.getElementById("logoutCard").onclick = logout;