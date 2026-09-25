const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected account routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

module.exports = router;