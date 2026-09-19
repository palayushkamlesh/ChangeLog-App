const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");


// ================================
// Generate Access Token
// ================================
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};


// ================================
// Generate Refresh Token
// ================================
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// ================================
// Signup
// ================================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
      emailVerified: false,
    });

    res.status(201).json({
      message: "Signup successful. Email verification simulated.",
      userId: user._id,
      verificationToken,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Signup failed",
    });
  }
};


// ================================
// Verify Email
// ================================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification token",
      });
    }

    user.emailVerified = true;
    user.verificationToken = null;

    await user.save();

    res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Email verification failed",
    });
  }
};


// ================================
// Login
// ================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};


// ================================
// Refresh Token
// ================================
exports.refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Token rotation
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};


// ================================
// Logout
// ================================
exports.logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({
    message: "Logged out successfully",
  });
};


// ================================
// Forgot Password
// ================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.json({
        message: "If the email exists, a reset link has been generated.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    res.json({
      message: "Password reset simulated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Forgot password failed",
    });
  }
};


// ================================
// Reset Password
// ================================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password reset failed",
    });
  }
};