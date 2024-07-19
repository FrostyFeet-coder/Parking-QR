const express = require("express");
const router = express.Router();
const QRData = require("../models/qrdata");

// GET UserDetails by userId
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    //  QR data for the specified user
    const qrData = await QRData.findOne({ userId });

    if (!qrData) {
      return res.status(404).send("User details not found");
    }

    // Render the userDetails.ejs template with qrData
    res.render("userDetails", { qrData });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Error fetching user details");
  }
});

module.exports = router;
