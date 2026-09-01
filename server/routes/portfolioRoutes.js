const express = require("express");
const router = express.Router();

const {
    createPortfolio,
    getPortfolio,
    updatePortfolio
} = require("../controllers/portfolioController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createPortfolio);
router.get("/", protect, getPortfolio);
router.put("/", protect, updatePortfolio);

module.exports = router;