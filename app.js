const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");
const dashboardRoutes = require("./routes/dashboard");
const userDetailsRouter = require("./routes/userDetails");

const app = express();

require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Sessions
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

// Middleware to make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Use express-ejs-layouts
app.use(ejsLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout"); // Set the default layout

// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userDetailsRouter);
app.use("/dashboard", dashboardRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
