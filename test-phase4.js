const fs = require("fs");
const path = require("path");

async function runPhase4Tests() {
    console.log("=================================================");
    console.log("  PHASE 4: TEMPLATE ENGINES TEST SUITE           ");
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

    const templates = ["corporate", "dark", "glass", "minimal"];
    const requiredDomIds = [
        "fullName",
        "headline",
        "tagline",
        "aboutText",
        "softSkills",
        "techSkills",
        "educationContainer",
        "experienceContainer",
        "projectsText",
        "email",
        "contactNumber",
        "profileImage"
    ];

    templates.forEach(t => {
        console.log(`--- Testing Template: ${t.toUpperCase()} ---`);
        const htmlPath = path.join(__dirname, `client/templates/${t}.html`);
        const cssPath = path.join(__dirname, `client/templates/${t}.css`);
        const jsPath = path.join(__dirname, `client/templates/${t}.js`);

        // Check file existence & non-zero size
        assert(fs.existsSync(htmlPath) && fs.statSync(htmlPath).size > 200, `${t}.html exists and is complete`);
        assert(fs.existsSync(cssPath) && fs.statSync(cssPath).size > 500, `${t}.css exists and has rich styles`);
        assert(fs.existsSync(jsPath) && fs.statSync(jsPath).size > 500, `${t}.js exists and has renderer logic`);

        // Check HTML contains all required DOM containers
        const htmlContent = fs.readFileSync(htmlPath, "utf-8");
        requiredDomIds.forEach(id => {
            assert(htmlContent.includes(`id="${id}"`), `${t}.html includes #${id}`);
        });

        // Check JS contains data fetching and array rendering
        const jsContent = fs.readFileSync(jsPath, "utf-8");
        assert(jsContent.includes("loadPortfolio"), `${t}.js has loadPortfolio()`);
        assert(jsContent.includes("data.education"), `${t}.js iterates over data.education array`);
        assert(jsContent.includes("data.experience"), `${t}.js iterates over data.experience array`);
        assert(jsContent.includes("data.profilePic"), `${t}.js binds profile picture`);
        assert(jsContent.includes("escapeHtml"), `${t}.js contains XSS escaping`);

        // Check CSS contains media queries
        const cssContent = fs.readFileSync(cssPath, "utf-8");
        assert(cssContent.includes("@media"), `${t}.css contains responsive @media breakpoints`);
    });

    console.log("\n=================================================");
    console.log(`  PHASE 4 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runPhase4Tests();
