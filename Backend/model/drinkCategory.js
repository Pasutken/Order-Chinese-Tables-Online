const mongoose = require('mongoose');
const DrinkItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String, // เช่น "ขวด", "กระป๋อง", "แก้ว"
    required: true,
  },
});

const DrinkCategorySchema = new mongoose.Schema({
  // เช่น "น้ำเปล่า", "น้ำอัดลม", "เบียร์"
  name: { 
    type: String,
    required: true,
    unique: true,
  },
  // ฝัง DrinkItemSchema เป็น Array ไว้ข้างใน
  items: [DrinkItemSchema], 

  // (ทางเลือก) เพิ่มลำดับการแสดงผล
  displayOrder: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// สร้าง index เพื่อให้ค้นหา 'name' ได้เร็ว และเรียงลำดับได้
DrinkCategorySchema.index({ displayOrder: 1, name: 1 });

module.exports = mongoose.model("DrinkCategory", DrinkCategorySchema);