const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

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
    res.redirect("/dashboard");
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

module.exports = router;
