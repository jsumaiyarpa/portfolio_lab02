const express = require("express");
const router = express.Router();

const {
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  publishPortfolio,
  getPublicPortfolio,
} = require("../controllers/portfolioController");

const protect = require("../middleware/authMiddleware");

// Public route for portfolio preview / sharing
router.get("/public/:id", getPublicPortfolio);

// Protected routes
router.post("/publish", protect, publishPortfolio);
router.post("/", protect, createPortfolio);
router.get("/", protect, getPortfolio);
router.put("/", protect, updatePortfolio);
router.delete("/", protect, deletePortfolio);

module.exports = router;