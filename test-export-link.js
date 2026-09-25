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
        body: options.body ? JSON.stringify(options.body) : undefined,
        redirect: options.redirect || "manual"
    });

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }
    } else {
        try {
            data = await response.text();
        } catch (e) {
            data = null;
        }
    }

    return {
        status: response.status,
        ok: response.ok,
        headers: response.headers,
        data
    };
}

async function runExportLinkTests() {
    console.log("=================================================");
    console.log("  TEST SUITE: REAL EXPORT AS LINK VERIFICATION   ");
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
    const testUser = {
        name: "Public Link Tester",
        email: `link_tester_${timestamp}@example.com`,
        password: "StrongPassword123!"
    };

    let token = "";
    let publicId = "";

    try {
        // Step 1: Register and get token
        console.log("--- 1. User Registration & Auth ---");
        const regRes = await request("/api/auth/register", {
            method: "POST",
            body: testUser
        });
        assert(regRes.status === 201, "User registered successfully");
        token = regRes.data.token;

        // Step 2: Test export link when NO portfolio exists
        console.log("\n--- 2. Export Link without Portfolio ---");
        const noPortPublish = await request("/api/portfolio/publish", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(noPortPublish.status === 404, "Export link before creating portfolio returns 404");

        // Step 3: Create a portfolio
        console.log("\n--- 3. Create Portfolio with Template 'glass' ---");
        const portfolioPayload = {
            fullName: "Public Link Tester Full",
            headline: "Senior Cloud Architect",
            tagline: "Architecting global distributed systems",
            about: "Experienced systems architect with expertise in cloud and frontend technologies.",
            email: testUser.email,
            contact: "+8801700000000",
            profilePic: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
            softSkills: "Leadership, Communication, Public Speaking",
            techSkills: "JavaScript, TypeScript, Node.js, Express, MongoDB, AWS",
            education: [
                { institution: "Oxford University", degree: "M.Sc. in Computer Science" }
            ],
            experience: [
                { company: "CloudScale Inc", duration: "2020 - Present", responsibilities: "Directing cloud engineering." }
            ],
            projects: "1. Global Scaler - Distributed pub-sub\n2. Portfolio Generator - SaaS portfolio platform",
            template: "glass"
        };

        const createRes = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: portfolioPayload
        });
        assert(createRes.status === 201 || createRes.status === 200, "Portfolio created successfully");
        assert(createRes.data.portfolio.publicId && typeof createRes.data.portfolio.publicId === "string", "Secure publicId generated automatically");
        publicId = createRes.data.portfolio.publicId;
        console.log(`     Generated publicId: "${publicId}"`);

        // Step 4: Publish Portfolio via Export as Link API
        console.log("\n--- 4. Publish Portfolio via POST /api/portfolio/publish ---");
        const publishRes = await request("/api/portfolio/publish", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(publishRes.status === 200, "POST /api/portfolio/publish returns 200");
        assert(publishRes.data.publicId === publicId, "Publish endpoint returns matching publicId");
        assert(publishRes.data.isPublic === true, "Portfolio marked as isPublic = true");

        // Step 5: Public Route GET /p/:publicId without authentication
        console.log("\n--- 5. Public Route GET /p/:publicId (Unauthenticated) ---");
        const publicRouteRes = await request(`/p/${publicId}`, {
            redirect: "manual"
        });
        assert(publicRouteRes.status === 302 || publicRouteRes.status === 200, "GET /p/:publicId accessible without authentication");
        const locationHeader = publicRouteRes.headers.get("location") || "";
        assert(locationHeader.includes("/templates/glass.html") && locationHeader.includes(publicId), `GET /p/:publicId redirects to selected template (/templates/glass.html?id=${publicId})`);

        // Step 6: Public Data API GET /api/portfolio/public/:publicId (Unauthenticated)
        console.log("\n--- 6. Public API GET /api/portfolio/public/:publicId (Unauthenticated) ---");
        const publicDataRes = await request(`/api/portfolio/public/${publicId}`);
        assert(publicDataRes.status === 200, "GET /api/portfolio/public/:publicId returns 200");
        assert(publicDataRes.data.fullName === portfolioPayload.fullName, "Public data contains correct fullName");
        assert(publicDataRes.data.headline === portfolioPayload.headline, "Public data contains correct headline");
        assert(publicDataRes.data.template === "glass", "Public data contains correct template 'glass'");
        assert(publicDataRes.data.education.length === 1, "Public data contains education array");
        assert(publicDataRes.data.experience.length === 1, "Public data contains experience array");
        assert(!publicDataRes.data.password && !publicDataRes.data.token, "Security check: Password and tokens are NOT exposed");

        // Step 7: Update template to 'dark' and verify public route updates dynamically
        console.log("\n--- 7. Dynamic Template Switch to 'dark' ---");
        const updateTmplRes = await request("/api/portfolio", {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: { template: "dark" }
        });
        assert(updateTmplRes.status === 200, "Updated template to 'dark'");

        const darkPublicRouteRes = await request(`/p/${publicId}`, {
            redirect: "manual"
        });
        const darkLocation = darkPublicRouteRes.headers.get("location") || "";
        assert(darkLocation.includes("/templates/dark.html") && darkLocation.includes(publicId), "GET /p/:publicId dynamically routes to updated 'dark' template");

        // Step 8: Invalid publicId handling
        console.log("\n--- 8. Invalid publicId Error Handling ---");
        const invalidRouteRes = await request("/p/nonExistentId9999", {
            redirect: "manual"
        });
        assert(invalidRouteRes.status === 404, "Invalid /p/:publicId returns 404 Not Found");
        assert(typeof invalidRouteRes.data === "string" && invalidRouteRes.data.includes("Portfolio Not Found"), "404 page renders professional 'Portfolio Not Found' HTML");

        const invalidApiRes = await request("/api/portfolio/public/nonExistentId9999");
        assert(invalidApiRes.status === 404, "Invalid API lookup returns 404 JSON");

        // Step 9: Cleanup
        console.log("\n--- 9. Account Cleanup ---");
        const delRes = await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(delRes.status === 200, "Test account cleaned up successfully");

    } catch (error) {
        console.error("Test execution error:", error);
        failed++;
    }

    console.log("\n=================================================");
    console.log(`  EXPORT AS LINK TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runExportLinkTests();
