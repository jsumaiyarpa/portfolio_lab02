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

async function runPhase5Tests() {
    console.log("=================================================");
    console.log("  PHASE 5: PROFILE & NAVIGATION TEST SUITE       ");
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
        name: "Phase 5 Lead",
        email: `phase5_${timestamp}@example.com`,
        password: "OriginalPassword123!"
    };

    try {
        // 1. Register & Login
        const reg = await request("/api/auth/register", { method: "POST", body: user });
        const token = reg.data.token;

        // 2. Fetch Profile via /api/auth/me
        console.log("--- 1. Get User Profile ---");
        const meRes = await request("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert(meRes.status === 200, "GET /api/auth/me returns 200");
        assert(meRes.data.user.name === user.name, "User name matches profile");
        assert(meRes.data.user.email === user.email, "User email matches profile");

        // 3. Update Profile Name
        console.log("\n--- 2. Update Profile Name & Email ---");
        const updatedName = "Phase 5 Lead Architect";
        const updateNameRes = await request("/api/auth/profile", {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: { name: updatedName }
        });
        assert(updateNameRes.status === 200, "PUT /api/auth/profile returns 200 on name change");
        assert(updateNameRes.data.user.name === updatedName, "Updated name persisted");

        // 4. Change Password & Verify Login with New Password
        console.log("\n--- 3. Change Password Flow ---");
        const newPassword = "NewEncryptedPassword456!";

        // Wrong current password should fail
        const badPassRes = await request("/api/auth/password", {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: { currentPassword: "WrongPassword!", newPassword }
        });
        assert(badPassRes.status === 400, "Change password with invalid current password rejected with 400");

        // Valid current password should succeed
        const changePassRes = await request("/api/auth/password", {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: { currentPassword: user.password, newPassword }
        });
        assert(changePassRes.status === 200, "Change password succeeds with 200");

        // Test login with old password (must fail)
        const oldLogin = await request("/api/auth/login", {
            method: "POST",
            body: { email: user.email, password: user.password }
        });
        assert(oldLogin.status === 400, "Login with obsolete password rejected with 400");

        // Test login with new password (must succeed)
        const newLogin = await request("/api/auth/login", {
            method: "POST",
            body: { email: user.email, password: newPassword }
        });
        assert(newLogin.status === 200, "Login with newly updated password succeeds with 200");
        const newToken = newLogin.data.token;

        // 5. Template Selection Persistence
        console.log("\n--- 4. Template Selection Persistence ---");
        // Create portfolio
        await request("/api/portfolio", {
            method: "POST",
            headers: { Authorization: `Bearer ${newToken}` },
            body: {
                fullName: updatedName,
                headline: "Tech Lead",
                tagline: "Building resilient systems",
                about: "Experienced architect.",
                email: user.email,
                contact: "01711223344",
                softSkills: "Leadership",
                techSkills: "Node.js, Docker",
                education: [],
                experience: [],
                template: "corporate"
            }
        });

        // Switch template to "glass"
        const switchRes = await request("/api/portfolio", {
            method: "PUT",
            headers: { Authorization: `Bearer ${newToken}` },
            body: { template: "glass" }
        });
        assert(switchRes.status === 200, "Template update returns 200");

        const getPort = await request("/api/portfolio", {
            headers: { Authorization: `Bearer ${newToken}` }
        });
        assert(getPort.data.template === "glass", "Template persisted in database as 'glass'");

        // 6. Delete Account
        console.log("\n--- 5. Delete Account ---");
        const delAcc = await request("/api/auth/account", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${newToken}` }
        });
        assert(delAcc.status === 200, "Account deleted with 200");

    } catch (e) {
        console.error("Phase 5 test error:", e);
        failed++;
    }

    console.log("\n=================================================");
    console.log(`  PHASE 5 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runPhase5Tests();
