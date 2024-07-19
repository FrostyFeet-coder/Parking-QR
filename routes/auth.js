const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const crypto = require("crypto");
const createTransporter = require('../config/nodemailer'); // Ensure this path is correct

// Render signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// User signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already in use:", email);
      return res.status(400).send("Email already in use.");
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Hashed Password:', hashedPassword);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      qrCode: "",
    });

    await newUser.save();
    console.log("User signed up successfully:", email);
    res.status(201).send("User signed up successfully");
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send("Error signing up");
  }
});

// Render login page
router.get("/login", (req, res) => {
  res.render("login");
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).send("User not found");
    }

    console.log("User found:", email);

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user.password) {
      console.log("Password does not match for user:", email);
      return res.status(400).send("Invalid credentials");
    }

    // Set session data
    req.session.user = user;
    console.log("User logged in successfully:", email);
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});

// Logout user
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Error logging out");
    }
    console.log("User logged out successfully");
    res.redirect("/");
  });
});
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

router.post("/forgot-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Processing forgot password request for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(404).send("User with that email does not exist.");
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    let transporter;
    try {
      transporter = createTransporter(email, password);
      console.log("Transporter created successfully");
    } catch (error) {
      console.error("Error creating transporter:", error);
      return res.status(500).send("Failed to create transporter.");
    }

    const resetUrl = `http://localhost:3000/auth/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      from: email,
      subject: "Password Reset",
      html: `<p>You requested a password reset</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
    });

    console.log("Password reset email sent to:", email);
    res.status(200).send("Password reset email sent.");
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res.status(500).send("Error processing request.");
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    console.log("Processing reset password request for token:", token);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.error("Invalid or expired reset token:", token);
      return res
        .status(400)
        .send("Password reset token is invalid or has expired.");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("Password successfully reset for user:", user.email);
    res.status(200).send("Password has been reset.");
  } catch (error) {
    console.error("Error processing reset password request:", error);
    res.status(500).send("Error processing request.");
  }
});

module.exports = router;
