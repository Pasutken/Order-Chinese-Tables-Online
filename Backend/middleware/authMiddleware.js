// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
  // 1. ดึง Token จาก Header
  // (Frontend ต้องส่งมาใน Header แบบ: Authorization: 'Bearer <token>')
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // 2. แยกคำว่า 'Bearer ' ออก
  const token = authHeader.split(" ")[1]; // [ 'Bearer', '<token>' ]

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. Token format is invalid." });
  }

  try {
    // 3. (สำคัญ) ตรวจสอบ Token
    // (payload คือสิ่งที่เรายัดไส้ไว้ตอน login เช่น { user: { id: '...' } })
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. (สำคัญ) "แนบ" ข้อมูล user ไปกับ req
    // เพื่อให้ Route ที่อยู่ "ด่านถัดไป" ใช้งานได้
    req.user = payload.user;
    console.log("req.user",req.user)

    // 5. (สำคัญที่สุด) ปล่อยให้ request ผ่านไปที่ Route จริง
    next();
  } catch (ex) {
    // ถ้า Token ผิด (หมดอายุ, ปลอม)
    res.status(401).json({ error: "Invalid token." });
  }
}

module.exports = authMiddleware;
