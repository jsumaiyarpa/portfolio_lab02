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

async function runPhase1Tests() {
    console.log("==========================================");
    console.log("  PHASE 1: BACKEND & SECURITY TEST SUITE  ");
    console.log("==========================================\n");

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
        name: "Security Tester",
        email: `  Test.User.${timestamp}@EXAMPLE.com  `, // Test normalization
        password: "SuperSecretPassword123!"
    };

    try {
        // 1. 404 Handling
        console.log("--- 1. 404 & Centralized Error Handling ---");
        const notFound = await request("/api/non-existent-route-xyz");
        assert(notFound.status === 404, "Undefined route returns 404 status");
        assert(notFound.data && notFound.data.status === "fail", "404 handler returns structured JSON");

        // 2. Input Validation - Missing Fields
        console.log("\n--- 2. Input Validation ---");
        const missingFields = await request("/api/auth/register", {
            method: "POST",
            body: { name: "No Email" }
        });
        assert(missingFields.status === 400, "Registration with missing fields rejected with 400");

        // 3. Input Validation - Short Password
        const shortPass = await request("/api/auth/register", {
            method: "POST",
            body: { name: "Short Pass", email: `short_${timestamp}@example.com`, password: "123" }
        });
        assert(shortPass.status === 400, "Registration with password < 6 chars rejected with 400");

        // 4. Registration & Password Sanitization
        console.log("\n--- 3. Registration, Email Normalization & Password Sanitization ---");
        const reg = await request("/api/auth/register", {
            method: "POST",
            body: testUser
        });
        assert(reg.status === 201, "Registration succeeds with 201");
        assert(reg.data && reg.data.user, "User object returned in registration");
        assert(reg.data.user.password === undefined, "Password hash is strictly NOT returned in registration payload");
        assert(reg.data.user.email === `test.user.${timestamp}@example.com`, "Email is normalized and trimmed");
        assert(reg.data.token && typeof reg.data.token === "string", "Valid JWT token generated upon registration");

        // 5. Login with normalized email
        console.log("\n--- 4. Login & Authentication ---");
        const login = await request("/api/auth/login", {
            method: "POST",
            body: { email: `TEST.USER.${timestamp}@example.COM`, password: testUser.password }
        });
        assert(login.status === 200, "Login succeeds with case-insensitive normalized email");
        assert(login.data.token !== undefined, "Login returns JWT token");
        assert(login.data.user && login.data.user.password === undefined, "Login response does not leak password hash");

        const token = login.data.token;

        // 6. JWT Authentication & IDOR Verification
        console.log("\n--- 5. JWT Route Protection & IDOR Security ---");
        const unauth = await request("/api/auth/me");
        assert(unauth.status === 401, "Unauthenticated request to /api/auth/me returns 401");

        const badToken = await request("/api/auth/me", {
            headers: { Authorization: "Bearer invalid_token_xyz" }
        });
        assert(badToken.status === 401, "Invalid JWT token rejected with 401");

        const auth = await request("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(auth.status === 200, "Authenticated request to /api/auth/me returns 200");
        assert(auth.data.user.email === `test.user.${timestamp}@example.com`, "Authenticated user profile matches token owner");

        // 7. Cleanup
        const delAcc = await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(delAcc.status === 200, "Account deleted cleanly");

    } catch (e) {
        console.error("Test execution failed:", e);
        failed++;
    }

    console.log("\n==========================================");
    console.log(`  PHASE 1 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runPhase1Tests();
