const mongoose = require('mongoose');

const DrinkSetSchema = new mongoose.Schema({
  // ใช้แทน 'id' (เช่น "setA", "setB")
  setId: { 
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  pricePerTable: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// สร้าง index เพื่อให้ค้นหา setId ได้เร็วขึ้น
DrinkSetSchema.index({ setId: 1 });

// (ตรวจสอบก่อน) ถ้า mongoose.models.DrinkSet มีอยู่แล้ว ก็ใช้ตัวเก่า
// ถ้ายังไม่มี (||) ค่อยสร้างใหม่
module.exports = mongoose.models.DrinkSet || mongoose.model("DrinkSet", DrinkSetSchema);