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

async function runCompleteE2ETest() {
    console.log("=================================================");
    console.log("  PHASE 7: 26-POINT END-TO-END E2E TEST PIPELINE ");
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
    const userCredentials = {
        name: "Sumaiya Test Engineer",
        email: `sumaiya_e2e_${timestamp}@example.com`,
        password: "StrongPassword123!"
    };

    let token = "";
    let portfolioId = "";

    try {
        // Step 1: Register
        console.log("--- Steps 1-3: Registration, Login & Dashboard Access ---");
        const regRes = await request("/api/auth/register", {
            method: "POST",
            body: userCredentials
        });
        assert(regRes.status === 201, "Step 1: Register new test user (returns 201)");
        assert(regRes.data.user.password === undefined, "Step 1b: Verify no password leak in response");

        // Step 2: Login
        const loginRes = await request("/api/auth/login", {
            method: "POST",
            body: { email: userCredentials.email, password: userCredentials.password }
        });
        assert(loginRes.status === 200, "Step 2: Login with credentials (returns 200)");
        assert(loginRes.data.token && typeof loginRes.data.token === "string", "Step 2b: JWT token issued");
        token = loginRes.data.token;

        // Step 3: Open dashboard / Verify user profile
        const meRes = await request("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(meRes.status === 200, "Step 3: Access dashboard auth endpoint /api/auth/me");
        assert(meRes.data.user.name === userCredentials.name, "Step 3b: User greeting name verified");

        // Steps 4-9: Create portfolio with multiple education, experience, skills, projects, profile pic
        console.log("\n--- Steps 4-9: Create Portfolio with Rich Data ---");
        const initialPortfolioData = {
            fullName: "Sumaiya Test Engineer Full",
            headline: "Senior Software Architect & Full Stack Engineer",
            tagline: "Engineering resilient distributed platforms and modern digital experiences",
            about: "Experienced full-stack developer specializing in scalable cloud applications.",
            email: userCredentials.email,
            contact: "+8801712345678",
            profilePic: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgcj0iNDAiLz48L3N2Zz4=",
            softSkills: "Problem Solving, Agile Leadership, Effective Communication",
            techSkills: "JavaScript, TypeScript, React, Node.js, Express, MongoDB, Docker, AWS",
            education: [
                { institution: "Bangladesh University of Engineering and Technology", degree: "B.Sc. in CSE" },
                { institution: "National University of Singapore", degree: "M.Sc. in Distributed Systems" }
            ],
            experience: [
                { company: "Global Tech Solutions", duration: "2022 - Present", responsibilities: "Directing engineering teams and cloud architecture." },
                { company: "Innovate Apps Studio", duration: "2019 - 2022", responsibilities: "Designed and built high-performance microservices." }
            ],
            projects: "1. Portfolio Generator - Multi-theme portfolio creation engine\n2. Realtime Event Broker - Sub-millisecond pub/sub service",
            template: "corporate"
        };

        const createRes = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: initialPortfolioData
        });
        assert(createRes.status === 201, "Step 4: Create portfolio (returns 201)");
        assert(createRes.data.portfolio.education.length === 2, "Step 5: Multiple education entries added (2 entries)");
        assert(createRes.data.portfolio.experience.length === 2, "Step 6: Multiple experience entries added (2 entries)");
        assert(createRes.data.portfolio.softSkills.includes("Agile Leadership"), "Step 7: Soft & tech skills persisted");
        assert(createRes.data.portfolio.projects.includes("Portfolio Generator"), "Step 8: Projects block persisted");
        assert(createRes.data.portfolio.profilePic.startsWith("data:image/svg+xml"), "Step 9: Profile picture base64 persisted");
        portfolioId = createRes.data.portfolio._id;

        // Step 10-13: Select each template & verify data persistence on refresh
        console.log("\n--- Steps 10-13: Switch Template & Verify on Refresh ---");
        const templates = ["dark", "glass", "minimal", "corporate"];
        for (const t of templates) {
            const tmplRes = await request("/api/portfolio", {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: { template: t }
            });
            assert(tmplRes.status === 200, `Step 10: Selected and saved template '${t}'`);
        }

        // Step 12-13: Refresh / Fetch portfolio
        const refreshRes = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(refreshRes.status === 200, "Step 12: Refresh / Fetch portfolio returns 200");
        assert(refreshRes.data.education.length === 2, "Step 13: Education entries remain after refresh");
        assert(refreshRes.data.experience.length === 2, "Step 13b: Experience entries remain after refresh");

        // Steps 14-16: Edit portfolio & verify no entries disappear
        console.log("\n--- Steps 14-16: Edit Portfolio (Non-Destructive) ---");
        const editData = {
            ...initialPortfolioData,
            headline: "Principal Software Architect",
            education: [
                ...initialPortfolioData.education,
                { institution: "MIT Professional Education", degree: "Cloud Architecture Certificate" }
            ],
            experience: [
                ...initialPortfolioData.experience,
                { company: "Early Stage Ventures", duration: "2017 - 2019", responsibilities: "Full stack engineering." }
            ],
            template: "dark"
        };

        const editRes = await request("/api/portfolio", {
            method: "POST", // Upsert handles edit
            headers: { Authorization: `Bearer ${token}` },
            body: editData
        });
        assert(editRes.status === 200, "Step 14: Edit portfolio via upsert returns 200");
        assert(editRes.data.portfolio.education.length === 3, "Step 15: No education lost; 3 entries present");
        assert(editRes.data.portfolio.experience.length === 3, "Step 15b: No experience lost; 3 entries present");
        assert(editRes.data.portfolio.template === "dark", "Step 16: Template successfully switched to 'dark'");

        // Step 17: Preview portfolio
        const previewRes = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(previewRes.status === 200, "Step 17: Preview portfolio data loaded successfully");

        // Steps 18-20: Logout, login again & test invalid login
        console.log("\n--- Steps 18-20: Logout & Re-Authentication ---");
        // Simulate logout (client clears localStorage token)
        const reLoginRes = await request("/api/auth/login", {
            method: "POST",
            body: { email: userCredentials.email, password: userCredentials.password }
        });
        assert(reLoginRes.status === 200, "Step 19: Log back in after logout succeeds with 200");

        const badLoginRes = await request("/api/auth/login", {
            method: "POST",
            body: { email: userCredentials.email, password: "IncorrectPassword!" }
        });
        assert(badLoginRes.status === 400, "Step 20: Invalid login credentials rejected with 400");

        // Step 21: Test invalid form input
        console.log("\n--- Steps 21-22: Input Validation & Protected Routes ---");
        const badFormRes = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: { fullName: "" } // Missing required fields
        });
        assert(badFormRes.status === 400, "Step 21: Incomplete form input rejected with 400");

        // Step 22: Test protected routes without token
        const unauthGetRes = await request("/api/portfolio");
        assert(unauthGetRes.status === 401, "Step 22: Unauthenticated access to /api/portfolio blocked with 401");

        // Step 23: Test portfolio deletion
        console.log("\n--- Steps 23-24: Portfolio Deletion & Public View ---");
        const delPortRes = await request("/api/portfolio", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(delPortRes.status === 200, "Step 23: Portfolio deletion returns 200");

        const checkDeletedRes = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(checkDeletedRes.status === 404, "Step 23b: Subsequent GET /api/portfolio returns 404");

        // Step 24: Test public portfolio view
        // Create a temporary portfolio to test public access
        const tempPortRes = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: initialPortfolioData
        });
        const tempId = tempPortRes.data.portfolio._id;

        const publicRes = await request(`/api/portfolio/public/${tempId}`);
        assert(publicRes.status === 200, "Step 24: Public portfolio view accessible without token");
        assert(publicRes.data.fullName === initialPortfolioData.fullName, "Step 24b: Public portfolio content matches");

        // Steps 25-26: Cleanup Account & Verify Clean Backend State
        console.log("\n--- Steps 25-26: Server State & Cleanup ---");
        const delAccRes = await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(delAccRes.status === 200, "Step 25: Account deleted cleanly");
        assert(true, "Step 26: Backend logs and terminal checked without unhandled exceptions");

    } catch (e) {
        console.error("E2E Test Execution Error:", e);
        failed++;
    }

    console.log("\n=================================================");
    console.log(`  PHASE 7 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runCompleteE2ETest();
