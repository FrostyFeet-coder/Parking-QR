const express = require("express");
const User = require("../models/User");
const router = express.Router();

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.session.user) {
      console.log("No user session found, redirecting to login.");
      return res.redirect("/auth/login");
    }

    // Assuming the first user in the database is the admin
    const adminUser = await User.findOne({ email: "wasan.ansh@gmail.com" });
    if (!adminUser) {
      console.log("Admin user not found in the database.");
      return res.redirect("/auth/login");
    }

    if (req.session.user.email !== adminUser.email) {
      console.log("User is not admin, redirecting to login.");
      return res.redirect("/auth/login");
    }

    next();
  } catch (error) {
    console.error("Error in adminMiddleware:", error);
    res.redirect("/auth/login");
  }
};

// Admin Dashboard
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin", { users });
  } catch (error) {
    console.error("Error fetching users for admin dashboard:", error);
    res.redirect("/auth/login");
  }
});

module.exports = router;
