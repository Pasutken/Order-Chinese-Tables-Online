const express = require("express");
const ContactMessage = require("../model/ContactMessageModel.js");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Contact
 *     description: ติดต่อสอบถาม
 */

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: ส่งข้อความติดต่อสอบถาม
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - emailOrPhone
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: สมชาย ใจดี
 *               emailOrPhone:
 *                 type: string
 *                 example: 0912345678
 *               message:
 *                 type: string
 *                 example: สอบถามแพ็กเกจ 10 โต๊ะ ราคาเท่าไหร่ครับ
 *     responses:
 *       201:
 *         description: ส่งข้อความสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               message: "ส่งข้อความเรียบร้อยแล้ว"
 *               data: { "_id": "67a1b2c3d4e5f6789abcdef0", "name": "สมชาย", ... }
 *       400:
 *         description: กรอกข้อมูลไม่ครบ
 */

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, emailOrPhone, message } = req.body;

    if (!name || !emailOrPhone || !message) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const newMessage = new ContactMessage({
      name,
      emailOrPhone,
      message,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json({
      message: "ส่งข้อความเรียบร้อยแล้ว",
      data: savedMessage,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกข้อความ:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาด Server", error: error.message });
  }
});

module.exports = router;