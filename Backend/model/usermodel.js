const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ---------------------------------------------------------------
  // กลุ่มข้อมูลระบุตัวตน (Identifiers)
  // ---------------------------------------------------------------
  
  // 1. เบอร์โทร (สำหรับคนสมัครปกติ)
  // - ไม่ใส่ required: true (เพราะคน Login Google อาจจะยังไม่มีเบอร์)
  // - ใส่ sparse: true (เพื่อให้ยอมรับค่า null ได้หลายคน โดยไม่ Error Duplicate Key)
  phone: { type: String, unique: true, sparse: true }, 

  // 2. อีเมล (สำหรับคน Login Google)
  // - ไม่ใส่ required: true (เพราะคนสมัครปกติ ไม่ได้กรอก email)
  // - ใส่ sparse: true (สำคัญมาก! ไม่งั้นคนสมัครปกติจะ Error เพราะ email เป็น null ซ้ำกัน)
  email: { type: String, unique: true, sparse: true },

  // 3. Google ID
  googleId: { type: String, unique: true, sparse: true },

  // ---------------------------------------------------------------
  // ข้อมูลทั่วไป
  // ---------------------------------------------------------------
  password: { type: String }, // มีเฉพาะคนสมัครปกติ
  
  username: { type: String }, // ชื่อผู้ใช้ (อาจใช้เบอร์โทร หรือ ชื่อจาก Google ก็ได้)
  displayName: { type: String }, // ชื่อที่แสดงผล (มาจาก Google)
  lastname: { type: String },

  role: { type: String, default: "customer" },
  
  details: {
    address: { type: String },
    city: { type: String },
    province: { type: String },
    zipcode: { type: String },
  },

  provider: { type: String, default: "local" } // local หรือ google

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);