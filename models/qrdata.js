const mongoose = require("mongoose");

const qrDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  phone: String,
  carname: String,
  numberplate: String,
});

module.exports = mongoose.model("QRData", qrDataSchema);
