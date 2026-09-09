const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

// 1. เส้นทางเริ่มต้น Login (เหมือนเดิม)
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

// 2. เส้นทาง Callback (แก้ไขใหม่)
router.get(
  "/google/callback",
  // 2. ใช้ Passport เพื่อตรวจสอบ (ยังคงใช้ session ชั่วคราว)
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    session: true, // เรายังต้องใช้ session ชั่วคราวเพื่อเอา req.user
  }),
  (req, res) => {
    // 3. ถ้ามาถึงตรงนี้ได้ = Login สำเร็จ และ req.user ถูกสร้างโดย Passport
    if (!req.user) {
      return res.redirect(
        "http://localhost:5173/login?error=AuthenticationFailed"
      );
    }

    // 4. สร้าง Payload สำหรับ Token (ดึงข้อมูลมาจาก req.user)
    const payload = {
      user: {
        id: req.user._id.toString(), // ใช้ _id หรือ id ก็ได้ (แต่แนะนำ toString() ให้ชัวร์)
        googleId: req.user.googleId,
        displayName: req.user.displayName,
        email: req.user.email,
        role: req.user.role || "customer",
      }
    };

    // 5. สร้าง (Sign) Token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // ใช้ secret key จาก .env
      { expiresIn: "1d" } // Token มีอายุ 1 วัน (หรือตั้งค่าตามต้องการ)
    );
    res.redirect(
      `http://localhost:5173/login?token=${token}&role=${req.user.role}`
    );
  }
);

module.exports = router;
