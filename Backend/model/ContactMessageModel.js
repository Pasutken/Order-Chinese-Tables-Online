const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "กรุณาระบุชื่อ"],
    trim: true,
  },
  emailOrPhone: {
    type: String,
    required: [true, "กรุณาระบุอีเมลหรือเบอร์โทร"],
    trim: true,
  },
  message: {
    type: String,
    required: [true, "กรุณาระบุข้อความ"],
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ContactMessage", ContactMessageSchema);