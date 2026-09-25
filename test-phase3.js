const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000";

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = options.headers || {};
    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    return {
        status: response.status,
        ok: response.ok,
        data
    };
}

async function runPhase3Tests() {
    console.log("=================================================");
    console.log("  PHASE 3: FORM & DATA MANAGEMENT TEST SUITE     ");
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

    const timestamp = Date.now();
    const user = {
        name: "Phase 3 Engineer",
        email: `phase3_${timestamp}@example.com`,
        password: "Password123!"
    };

    try {
        // 1. Asset Files Integrity Check
        console.log("--- 1. Asset Path & File Integrity ---");
        const assets = [
            "client/assets/background2.jpg",
            "client/assets/default-avatar.svg"
        ];
        assets.forEach(a => {
            const fullPath = path.join(__dirname, a);
            const exists = fs.existsSync(fullPath);
            assert(exists, `Asset file exists: ${a}`);
        });

        // 2. Authentication
        const reg = await request("/api/auth/register", { method: "POST", body: user });
        const token = reg.data.token;

        // 3. Multi-Item Creation with Base64 Profile Picture & Non-Corporate Template
        console.log("\n--- 2. Multi-Item Creation & Base64 Profile Picture ---");
        const multiItemPayload = {
            fullName: "Phase 3 Engineer Full",
            headline: "Senior Cloud & Platform Specialist",
            tagline: "Building scalable distributed architectures",
            about: "Experienced full stack software engineer with high scale expertise.",
            email: user.email,
            contact: "01711223344",
            profilePic: "data:image/svg+xml;base64,PHN2Zz48Y2lyY2xlIHI9IjUwIi8+PC9zdmc+",
            softSkills: "Mentorship, System Design, Communication",
            techSkills: "React, Node.js, Express, MongoDB, Docker, Kubernetes, AWS",
            education: [
                { institution: "University of Dhaka", degree: "B.Sc. in Computer Science" },
                { institution: "Cornell University", degree: "M.S. in Information Systems" },
                { institution: "Harvard Extension", degree: "Graduate Certificate in AI" }
            ],
            experience: [
                { company: "CloudScale Inc", duration: "2022 - Present", responsibilities: "Directing backend architecture" },
                { company: "DevStudio Labs", duration: "2019 - 2022", responsibilities: "Microservice delivery" },
                { company: "Startup Forge", duration: "2017 - 2019", responsibilities: "Full stack engineering" }
            ],
            projects: "1. Distributed Queue\n2. Realtime Chat Hub\n3. Portfolio Builder",
            template: "minimal" // Test preserving non-corporate template
        };

        const createRes = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: multiItemPayload
        });
        assert(createRes.status === 201, "Multi-item portfolio created with 201");
        assert(createRes.data.portfolio.education.length === 3, "All 3 education entries persisted in database");
        assert(createRes.data.portfolio.experience.length === 3, "All 3 experience entries persisted in database");
        assert(createRes.data.portfolio.template === "minimal", "Selected template 'minimal' saved correctly");
        assert(createRes.data.portfolio.profilePic.startsWith("data:image/svg+xml"), "Base64 profile picture saved");

        // 4. Edit Portfolio (Simulating form submission on edit)
        console.log("\n--- 3. Edit Portfolio Without Data Loss ---");
        const editPayload = {
            ...multiItemPayload,
            headline: "Principal Cloud Architect",
            education: [
                ...multiItemPayload.education,
                { institution: "Stanford Online", degree: "Executive Program in Leadership" }
            ]
        };

        const editRes = await request("/api/portfolio", {
            method: "POST", // Upsert handles edit
            headers: { Authorization: `Bearer ${token}` },
            body: editPayload
        });
        assert(editRes.status === 200, "Edit portfolio returns 200");
        assert(editRes.data.portfolio.headline === "Principal Cloud Architect", "Headline updated");
        assert(editRes.data.portfolio.education.length === 4, "No education entries lost; 4th entry appended cleanly");
        assert(editRes.data.portfolio.experience.length === 3, "All 3 experience entries still intact on edit");
        assert(editRes.data.portfolio.template === "minimal", "Custom template 'minimal' preserved on edit");

        // 5. Cleanup
        await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

    } catch (e) {
        console.error("Phase 3 test error:", e);
        failed++;
    }

    console.log("\n=================================================");
    console.log(`  PHASE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runPhase3Tests();
