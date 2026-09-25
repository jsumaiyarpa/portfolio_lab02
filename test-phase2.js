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

async function runPhase2Tests() {
    console.log("=================================================");
    console.log("  PHASE 2: PORTFOLIO BACKEND & CRUD TEST SUITE   ");
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
    const userA = {
        name: "User Phase 2A",
        email: `phase2_a_${timestamp}@example.com`,
        password: "Password123!"
    };

    const userB = {
        name: "User Phase 2B",
        email: `phase2_b_${timestamp}@example.com`,
        password: "Password456!"
    };

    try {
        // Register User A
        const regA = await request("/api/auth/register", { method: "POST", body: userA });
        const tokenA = regA.data.token;

        // Register User B
        const regB = await request("/api/auth/register", { method: "POST", body: userB });
        const tokenB = regB.data.token;

        // 1. Initial State: No portfolio exists
        console.log("--- 1. Initial State ---");
        const getEmpty = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(getEmpty.status === 404, "GET /api/portfolio returns 404 when no portfolio exists");

        // 2. Create Portfolio
        console.log("\n--- 2. Create Portfolio ---");
        const initialData = {
            fullName: "User A Full Name",
            headline: "Lead Architect",
            tagline: "Innovative Software Solutions",
            about: "Experienced full stack software engineer.",
            email: userA.email,
            contact: "01700000000",
            softSkills: "Problem Solving, Communication",
            techSkills: "Node.js, Express, MongoDB",
            education: [{ institution: "BUET", degree: "B.Sc. CSE" }],
            experience: [{ company: "Tech Hub", duration: "2020 - Present", responsibilities: "Backend scaling" }],
            projects: "1. Project Alpha\n2. Project Beta",
            template: "corporate"
        };

        const createRes = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: initialData
        });
        assert(createRes.status === 201, "POST /api/portfolio returns 201 Created");
        assert(createRes.data.portfolio && createRes.data.portfolio.fullName === "User A Full Name", "Portfolio created with correct data");
        const portfolioId = createRes.data.portfolio._id;

        // 3. Upsert Verification: Second POST updates existing instead of creating duplicate
        console.log("\n--- 3. Single Profile Upsert Enforcement ---");
        const secondPostData = {
            ...initialData,
            headline: "Principal Engineer & Lead Architect"
        };
        const upsertRes = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: secondPostData
        });
        assert(upsertRes.status === 200, "Second POST /api/portfolio returns 200 (Upsert update)");
        assert(upsertRes.data.portfolio.headline === "Principal Engineer & Lead Architect", "Upsert updated existing headline");
        assert(upsertRes.data.portfolio._id === portfolioId, "Same document ID preserved (no duplicate created)");

        // 4. Update Portfolio via PUT
        console.log("\n--- 4. Update Portfolio (PUT) ---");
        const putRes = await request("/api/portfolio", {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: { template: "dark", tagline: "Crafting modern cyber-aesthetic tools" }
        });
        assert(putRes.status === 200, "PUT /api/portfolio returns 200 OK");
        assert(putRes.data.portfolio.template === "dark", "Template successfully changed to 'dark'");
        assert(putRes.data.portfolio.tagline === "Crafting modern cyber-aesthetic tools", "Tagline successfully updated");

        // 5. Authorization & IDOR Isolation
        console.log("\n--- 5. Authorization & IDOR Security ---");
        const userBPortfolio = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        assert(userBPortfolio.status === 404, "User B cannot access User A's private portfolio (returns 404)");

        // 6. Public Portfolio Access
        console.log("\n--- 6. Public Portfolio Access ---");
        const publicRes = await request(`/api/portfolio/public/${portfolioId}`);
        assert(publicRes.status === 200, "GET /api/portfolio/public/:id returns 200 without Authorization header");
        assert(publicRes.data.fullName === "User A Full Name", "Public response returns expected portfolio content");

        // 7. Portfolio Deletion
        console.log("\n--- 7. Portfolio Deletion ---");
        const deleteRes = await request("/api/portfolio", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(deleteRes.status === 200, "DELETE /api/portfolio returns 200 OK");

        const getAfterDelete = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(getAfterDelete.status === 404, "GET /api/portfolio returns 404 after deletion");

        // 8. Account Deletion & Cascade Cleanliness
        console.log("\n--- 8. Account Deletion & Cascade Verification ---");
        // Re-create portfolio for User A
        await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: initialData
        });

        // Delete User A Account
        const delAccA = await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(delAccA.status === 200, "DELETE /api/auth/account returns 200");

        // Verify public access returns 404 (cascade deleted)
        const publicAfterUserDelete = await request(`/api/portfolio/public/${portfolioId}`);
        assert(publicAfterUserDelete.status === 404, "Portfolio is completely deleted and does not leave orphan documents");

        // Clean up User B
        await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenB}` }
        });

    } catch (e) {
        console.error("Phase 2 test execution error:", e);
        failed++;
    }

    console.log("\n=================================================");
    console.log(`  PHASE 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runPhase2Tests();
