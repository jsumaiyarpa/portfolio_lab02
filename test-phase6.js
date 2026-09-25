const fs = require("fs");
const path = require("path");

async function runPhase6Tests() {
    console.log("=================================================");
    console.log("  PHASE 6: UI/UX & RESPONSIVENESS AUDIT SUITE    ");
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

    const cssFiles = [
        "client/css/styles.css",
        "client/css/dashboard.css",
        "client/css/form.css",
        "client/css/portfolio.css",
        "client/css/profile.css",
        "client/css/template-gallery.css",
        "client/templates/corporate.css",
        "client/templates/dark.css",
        "client/templates/glass.css",
        "client/templates/minimal.css"
    ];

    cssFiles.forEach(relPath => {
        console.log(`--- Auditing CSS File: ${relPath} ---`);
        const fullPath = path.join(__dirname, relPath);
        assert(fs.existsSync(fullPath), `File exists: ${relPath}`);

        const content = fs.readFileSync(fullPath, "utf-8");

        // Check for balanced braces
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        assert(openBraces === closeBraces, `Balanced CSS braces (${openBraces} open, ${closeBraces} close)`);

        // Check for responsive media queries
        const hasMedia = content.includes("@media");
        assert(hasMedia, `Contains responsive @media query blocks`);

        // Check for viewport/box-sizing reset
        const hasBoxSizing = content.includes("box-sizing: border-box") || content.includes("*");
        assert(hasBoxSizing, `Includes standard box-sizing or reset`);
    });

    console.log("\n=================================================");
    console.log(`  PHASE 6 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runPhase6Tests();
