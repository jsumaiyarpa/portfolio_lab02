const http = require("http");

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

async function runTests() {
    console.log("=================================================");
    console.log("  PORTFOLIO BUILDER END-TO-END VERIFICATION SUITE");
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

    const uniqueId = Date.now();
    const testUserA = {
        name: "Test Engineer A",
        email: `engineer_a_${uniqueId}@example.com`,
        password: "Password123!"
    };

    const testUserB = {
        name: "Test Engineer B",
        email: `engineer_b_${uniqueId}@example.com`,
        password: "Password456!"
    };

    let tokenA = "";
    let tokenB = "";
    let portfolioIdA = "";

    try {
        // 1. Health Check
        console.log("--- 1. Backend Server & Health Check ---");
        const health = await request("/");
        assert(health.status === 200, "GET / returns 200 status");
        assert(health.data && health.data.status === "success", "GET / returns success payload");

        // 2. Authentication - Registration
        console.log("\n--- 2. Authentication & Security ---");
        const regA = await request("/api/auth/register", {
            method: "POST",
            body: testUserA
        });
        assert(regA.status === 201, "User A Registration returns 201 Created");
        assert(regA.data && regA.data.user && !regA.data.user.password, "Registration payload does NOT leak password hash");
        assert(regA.data && regA.data.token, "Registration issues valid JWT token");
        tokenA = regA.data.token;

        // Test duplicate registration
        const dupReg = await request("/api/auth/register", {
            method: "POST",
            body: testUserA
        });
        assert(dupReg.status === 400, "Duplicate email registration rejected with 400");

        // Test short password
        const shortPassReg = await request("/api/auth/register", {
            method: "POST",
            body: { name: "Short", email: `short_${uniqueId}@example.com`, password: "123" }
        });
        assert(shortPassReg.status === 400, "Short password rejected with 400");

        // 3. Authentication - Login
        console.log("\n--- 3. User Login ---");
        const loginA = await request("/api/auth/login", {
            method: "POST",
            body: { email: testUserA.email, password: testUserA.password }
        });
        assert(loginA.status === 200, "User A Login returns 200");
        assert(loginA.data && loginA.data.token, "User A Login returns valid JWT token");
        assert(loginA.data && loginA.data.user.name === testUserA.name, "Login returns correct user info");

        // Invalid password test
        const badLogin = await request("/api/auth/login", {
            method: "POST",
            body: { email: testUserA.email, password: "WrongPassword" }
        });
        assert(badLogin.status === 400, "Invalid password login rejected with 400");

        // 4. Protected Route & Profile Management
        console.log("\n--- 4. Protected Route & Profile APIs ---");
        const unauthMe = await request("/api/auth/me");
        assert(unauthMe.status === 401, "Unauthenticated /api/auth/me blocked with 401");

        const authMe = await request("/api/auth/me", {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(authMe.status === 200, "Authenticated /api/auth/me returns 200");
        assert(authMe.data.user.email === testUserA.email, "Current user profile matches registered email");

        // Update profile
        const updateProf = await request("/api/auth/profile", {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: { name: "Senior Engineer A Updated" }
        });
        assert(updateProf.status === 200, "Update profile returns 200");
        assert(updateProf.data.user.name === "Senior Engineer A Updated", "User name updated successfully");

        // Change password
        const newPasswordA = "NewSecurePassword789!";
        const changePass = await request("/api/auth/password", {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: { currentPassword: testUserA.password, newPassword: newPasswordA }
        });
        assert(changePass.status === 200, "Change password returns 200");

        // Verify login with new password
        const loginNewPass = await request("/api/auth/login", {
            method: "POST",
            body: { email: testUserA.email, password: newPasswordA }
        });
        assert(loginNewPass.status === 200, "Login with new password succeeds");
        tokenA = loginNewPass.data.token;

        // 5. Portfolio CRUD Operations
        console.log("\n--- 5. Portfolio CRUD Operations ---");
        const portfolioPayload = {
            fullName: "Senior Engineer A",
            headline: "Lead Full-Stack Architect",
            tagline: "Building scalable cloud platforms and delightful interfaces",
            about: "Passionate software engineer with 8+ years building enterprise applications.",
            email: testUserA.email,
            contact: "01712345678",
            profilePic: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
            softSkills: "Communication, Leadership, Strategic Planning",
            techSkills: "JavaScript, TypeScript, Node.js, Express, React, MongoDB, Docker",
            education: [
                { institution: "MIT", degree: "B.S. in Computer Science" },
                { institution: "Stanford", degree: "M.S. in Software Engineering" }
            ],
            experience: [
                { company: "Tech Giant Inc", duration: "2021 - Present", responsibilities: "Lead architect for cloud systems" },
                { company: "Startup Labs", duration: "2018 - 2021", responsibilities: "Full stack feature delivery" }
            ],
            projects: "1. Portfolio Generator - AI-powered portfolio maker\n2. Cloud Mesh - Distributed service mesh",
            template: "dark"
        };

        const createPort = await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: portfolioPayload
        });
        assert(createPort.status === 201 || createPort.status === 200, "Create portfolio returns 201/200");
        assert(createPort.data.portfolio && createPort.data.portfolio.fullName === portfolioPayload.fullName, "Created portfolio contains correct full name");
        assert(createPort.data.portfolio.education.length === 2, "Education array stored with 2 entries");
        assert(createPort.data.portfolio.experience.length === 2, "Experience array stored with 2 entries");
        portfolioIdA = createPort.data.portfolio._id;

        // Read portfolio
        const getPort = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(getPort.status === 200, "GET /api/portfolio returns 200");
        assert(getPort.data.template === "dark", "Portfolio template is 'dark'");
        assert(getPort.data.education[0].institution === "MIT", "Education item 0 institution is MIT");
        assert(getPort.data.experience[0].company === "Tech Giant Inc", "Experience item 0 company is Tech Giant Inc");

        // Update portfolio (Switch template to glass)
        const updatePort = await request("/api/portfolio", {
            method: "PUT",
            headers: { Authorization: `Bearer ${tokenA}` },
            body: { template: "glass", tagline: "Updated Tagline for Testing" }
        });
        assert(updatePort.status === 200, "PUT /api/portfolio returns 200");
        assert(updatePort.data.portfolio.template === "glass", "Portfolio template updated to 'glass'");
        assert(updatePort.data.portfolio.tagline === "Updated Tagline for Testing", "Portfolio tagline updated");

        // Public Portfolio View
        console.log("\n--- 6. Public / Shared Portfolio View ---");
        const publicPort = await request(`/api/portfolio/public/${portfolioIdA}`);
        assert(publicPort.status === 200, "GET /api/portfolio/public/:id returns 200 without auth header");
        assert(publicPort.data.fullName === portfolioPayload.fullName, "Public view returns correct portfolio data");

        // 7. Authorization & IDOR Protection
        console.log("\n--- 7. Authorization & IDOR Security Checks ---");
        const regB = await request("/api/auth/register", {
            method: "POST",
            body: testUserB
        });
        tokenB = regB.data.token;

        // User B tries to get their portfolio before creating one
        const getPortB = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        assert(getPortB.status === 404, "User B receives 404 (isolated from User A portfolio)");

        // 8. Deletion Pipeline
        console.log("\n--- 8. Portfolio & Account Deletion ---");
        const deletePort = await request("/api/portfolio", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(deletePort.status === 200, "DELETE /api/portfolio returns 200");

        const getAfterDelete = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(getAfterDelete.status === 404, "GET /api/portfolio after deletion returns 404");

        // Delete Account
        const deleteAccA = await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        assert(deleteAccA.status === 200, "DELETE /api/auth/account returns 200 for User A");

        const deleteAccB = await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        assert(deleteAccB.status === 200, "DELETE /api/auth/account returns 200 for User B");

    } catch (e) {
        console.error("Test execution error:", e);
        failed++;
    }

    console.log("\n=================================================");
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
