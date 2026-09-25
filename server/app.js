const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const Portfolio = require("./models/Portfolio");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });
connectDB();

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve client assets, pages, and templates statically
app.use(express.static(path.join(__dirname, "../client")));
app.use("/client", express.static(path.join(__dirname, "../client")));

// Public portfolio route - renders/redirects to the user's selected template
app.get("/p/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    let portfolio = await Portfolio.findOne({ publicId });

    if (!portfolio && publicId && publicId.match(/^[0-9a-fA-F]{24}$/)) {
      portfolio =
        (await Portfolio.findById(publicId)) ||
        (await Portfolio.findOne({ user: publicId }));
    }

    if (!portfolio) {
      return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Not Found - Portfolio Generator</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0f172a;
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 500px;
            padding: 40px 24px;
        }
        h1 { font-size: 3.5rem; margin: 0 0 10px; color: #38bdf8; }
        h2 { font-size: 1.5rem; margin: 0 0 16px; color: #f8fafc; }
        p { color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
        a {
            display: inline-block;
            background: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            transition: background 0.2s;
        }
        a:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <h2>Portfolio Not Found</h2>
        <p>The portfolio you are looking for does not exist or has not been published yet.</p>
        <a href="/html/index.html">Create a Portfolio</a>
    </div>
</body>
</html>`);
    }

    const template = portfolio.template || "corporate";
    const targetId = portfolio.publicId || portfolio._id;
    return res.redirect(`/templates/${template}.html?id=${targetId}`);
  } catch (error) {
    console.error("Public route error:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);

// Root test route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Portfolio Maker Backend is Running!"
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;