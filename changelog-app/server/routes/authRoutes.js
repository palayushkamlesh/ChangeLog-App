const express = require("express");

const {
  signup,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);

router.get("/verify-email/:token", verifyEmail);

router.post("/login", login);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

module.exports = router;