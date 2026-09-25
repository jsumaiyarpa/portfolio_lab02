const fs = require("fs");
const path = require("path");

console.log("=================================================");
console.log("  SIMULATED BROWSER QA & DOM INTEGRITY AUDIT     ");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

// 1. Check all HTML pages have matching JS & CSS files and proper DOM elements
const pages = [
    {
        name: "index.html (Auth)",
        html: "client/html/index.html",
        css: "client/css/styles.css",
        js: "client/js/script.js",
        elements: ["loginForm", "signupForm", "loginEmail", "loginPassword", "signupName", "signupEmail", "signupPassword", "signupConfirmPassword"]
    },
    {
        name: "dashboard.html (Dashboard)",
        html: "client/html/dashboard.html",
        css: "client/css/dashboard.css",
        js: "client/js/dashboard.js",
        elements: ["welcomeText", "createPortfolio", "editPortfolio", "previewPortfolio", "templateGallery", "profileSettings", "deletePortfolioCard", "logoutBtn"]
    },
    {
        name: "form.html (Form Builder)",
        html: "client/html/form.html",
        css: "client/css/form.css",
        js: "client/js/form.js",
        elements: ["portfolioForm", "fullName", "headline", "tagline", "email", "contact", "about", "softSkills", "techSkills", "educationList", "experienceList", "addEducationBtn", "addExperienceBtn", "projects", "profilePic", "profilePicPreview", "submitBtn"]
    },
    {
        name: "portfolio.html (Portfolio Preview)",
        html: "client/html/portfolio.html",
        css: "client/css/portfolio.css",
        js: "client/js/portfolio.js",
        elements: ["name", "headline", "tagline", "bio", "email", "contact", "softSkills", "techSkills", "educationContainer", "experienceContainer", "projects", "deleteBtn", "logoutBtn", "viewLiveTemplateBtn"]
    },
    {
        name: "template-gallery.html (Template Selector)",
        html: "client/html/template-gallery.html",
        css: "client/css/template-gallery.css",
        js: "client/js/template-gallery.js",
        elements: ["generateBtn"]
    },
    {
        name: "profile.html (Profile Settings)",
        html: "client/html/profile.html",
        css: "client/css/profile.css",
        js: "client/js/profile.js",
        elements: ["profileForm", "name", "email", "passwordForm", "currentPassword", "newPassword", "confirmNewPassword", "deleteAccountBtn", "logoutBtn"]
    },
    {
        name: "corporate.html (Corporate Theme)",
        html: "client/templates/corporate.html",
        css: "client/templates/corporate.css",
        js: "client/templates/corporate.js",
        elements: ["fullName", "headline", "tagline", "aboutText", "softSkills", "techSkills", "educationContainer", "experienceContainer", "projectsText", "email", "contactNumber", "profileImage"]
    },
    {
        name: "dark.html (Dark Theme)",
        html: "client/templates/dark.html",
        css: "client/templates/dark.css",
        js: "client/templates/dark.js",
        elements: ["fullName", "headline", "tagline", "aboutText", "softSkills", "techSkills", "educationContainer", "experienceContainer", "projectsText", "email", "contactNumber", "profileImage"]
    },
    {
        name: "glass.html (Glass Theme)",
        html: "client/templates/glass.html",
        css: "client/templates/glass.css",
        js: "client/templates/glass.js",
        elements: ["fullName", "headline", "tagline", "aboutText", "softSkills", "techSkills", "educationContainer", "experienceContainer", "projectsText", "email", "contactNumber", "profileImage"]
    },
    {
        name: "minimal.html (Minimal Theme)",
        html: "client/templates/minimal.html",
        css: "client/templates/minimal.css",
        js: "client/templates/minimal.js",
        elements: ["fullName", "headline", "tagline", "aboutText", "softSkills", "techSkills", "educationContainer", "experienceContainer", "projectsText", "email", "contactNumber", "profileImage"]
    }
];

pages.forEach(p => {
    console.log(`--- Checking Page: ${p.name} ---`);
    const htmlPath = path.join(__dirname, p.html);
    const cssPath = path.join(__dirname, p.css);
    const jsPath = path.join(__dirname, p.js);

    assert(fs.existsSync(htmlPath), `HTML file exists: ${p.html}`);
    assert(fs.existsSync(cssPath), `CSS file exists: ${p.css}`);
    assert(fs.existsSync(jsPath), `JS file exists: ${p.js}`);

    const html = fs.readFileSync(htmlPath, "utf-8");
    p.elements.forEach(elId => {
        assert(html.includes(`id="${elId}"`), `HTML contains #${elId}`);
    });
});

console.log("\n=================================================");
console.log(`  QA DOM AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================\n");

process.exit(failed > 0 ? 1 : 0);
