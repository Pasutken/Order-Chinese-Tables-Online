const express = require("express");
const User = require("../model/usermodel.js");
// (ลบ protect ออก)
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

// GET /api/users/username/:username
router.get("/username", authMiddleware, async (req, res) => {
  
  try {
    const userIdFromToken = req.user.id;
    const userRoleFromToken = req.user.role;
    console.log(userIdFromToken, userRoleFromToken);
    const user = await User.findOne({ _id: userIdFromToken }).select(
      "-password"
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT /api/users/id/:id
router.put("/id/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.phone = req.body.phone || user.phone;

      if (req.body.details) {
        user.details.address = req.body.details.address;
        user.details.city = req.body.details.city;
        user.details.province = req.body.details.province;
        user.details.zipcode = req.body.details.zipcode;
      }

      const updatedUser = await user.save();

      // ส่งข้อมูลที่อัปเดตแล้วกลับไป (ไม่เอา password)
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        phone: updatedUser.phone,
        details: updatedUser.details,
      });
    } else {
      res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
