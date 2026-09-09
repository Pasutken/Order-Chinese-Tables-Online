const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  price: { type: Number, required: true, min: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categorymenu",
    required: true,
  },
  available: { type: Boolean, default: true },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
