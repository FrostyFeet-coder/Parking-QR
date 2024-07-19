const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema({
  client: { type: String, required: true },
  review: { type: String, required: true },
});

const Testimonial = mongoose.model("Testimonial", TestimonialSchema);

module.exports = Testimonial;
