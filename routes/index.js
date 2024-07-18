const express = require("express");
const QRCode = require("qrcode");
const User = require("../models/User");
const router = express.Router();

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
};

// Home
router.get("/", (req, res) => {
  res.render("index");
});

// Dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render("dashboard", { user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Error fetching user data");
  }
});

// Generate QR Code
router.post("/generate-qr", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    // Example: Generating QR Code with user-specific information
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({
        name: user.name,
        phone: user.phone,
        carname: user.carName,
        numberplate: user.numberplate,
      })
    );

    // Saving QR Code to user document
    user.qrCode = qrCode;
    await user.save();

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error generating or saving QR code:", error);
    res.status(500).send("Error generating or saving QR code");
  }
});

module.exports = router;
