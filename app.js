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
const Testimonial = require('./models/Testimonial');

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
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userDetailsRouter);
app.use("/dashboard", dashboardRoutes);

const testimonials = [
  {
    client: "Avishi",
    review: "Exceptional service and attention to detail. Truly impressed!",
  },
  {
    client: "Parina",
    review:
      "Wonderful experience with top-notch support. Highly recommend to others.",
  },
];

// Define the function to add testimonials
async function addTestimonials() {
  try {
    for (const testimonial of testimonials) {
      const exists = await Testimonial.findOne({
        client: testimonial.client,
        review: testimonial.review,
      });

      if (!exists) {
        await Testimonial.create(testimonial);
        console.log(`Added testimonial from ${testimonial.client}`);
      } else {
        console.log(`Testimonial from ${testimonial.client} already exists`);
      }
    }
  } catch (err) {
    console.error("Error adding testimonials:", err);
  }
}

// addTestimonials();
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to " + process.env.MONGO_URI);
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});
