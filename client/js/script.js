document.addEventListener("DOMContentLoaded", () => {
  // If user is already logged in, redirect to dashboard
  const existingToken = localStorage.getItem("token");
  if (existingToken) {
    window.location.href = "dashboard.html";
    return;
  }

  // ================= SIGNUP =================
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("signupConfirmPassword").value;

      if (!name || !email || !password) {
        alert("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration Successful! Welcome to Portfolio Generator.");
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "dashboard.html";
          } else {
            document.getElementById("login").checked = true;
            document.getElementById("loginEmail").value = email;
            signupForm.reset();
          }
        } else {
          alert(data.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("Could not connect to the server. Please ensure the backend is running.");
      }
    });
  }

  // ================= LOGIN =================
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      if (!email || !password) {
        alert("Please provide both email and password");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "dashboard.html";
        } else {
          alert(data.message || "Login failed. Invalid credentials.");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Could not connect to the server. Please ensure the backend is running.");
      }
    });
  }

  // ================= HEADER NAVIGATION =================
  const navHome = document.getElementById("navHome");
  if (navHome) {
    navHome.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const navAbout = document.getElementById("navAbout");
  if (navAbout) {
    navAbout.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Portfolio Generator lets you craft, customize, and showcase your professional software engineering portfolios with multi-theme support.");
    });
  }

  const navHelp = document.getElementById("navHelp");
  if (navHelp) {
    navHelp.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Need assistance? Register for a free account, complete your profile in the portfolio builder, and select from our 4 modern templates: Corporate, Dark, Glass, and Minimal.");
    });
  }
});