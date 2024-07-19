const express = require("express");
const QRCode = require("qrcode");
const User = require("../models/User");
const QRData = require("../models/qrdata");
const router = express.Router();

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
};

// Dashboard
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.session.user._id);
  res.render("dashboard", { user });
});

// Generate QR Code
router.post("/generate-qr", authMiddleware, async (req, res) => {
  const { name, phone, carname, numberplate } = req.body;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for ID:", userId);
      return res.status(404).send("User not found");
    }

    // Create or update QR data
    let qrData = await QRData.findOne({ userId });
    if (!qrData) {
      qrData = new QRData({
        userId,
        name,
        phone,
        carname,
        numberplate,
      });
    } else {
      qrData.name = name;
      qrData.phone = phone;
      qrData.carname = carname;
      qrData.numberplate = numberplate;
    }
    await qrData.save();

    // Generate QR code with a dynamic URL containing userId
    const qrCodeURL = `https://parking-qr-2.onrender.com/user/${userId}`; // Update this URL if your domain or port changes
    const qrCode = await QRCode.toDataURL(qrCodeURL);

    // Update user QR code field
    user.qrCode = qrCode;
    await user.save();

    // Redirect back to dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).send("Error generating QR code");
  }
});

module.exports = router;
