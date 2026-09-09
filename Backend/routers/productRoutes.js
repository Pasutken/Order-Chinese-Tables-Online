const express = require("express");
const MenuItem = require("../model/Menumodel.js");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: รายการอาหารทั้งหมด (สำหรับเพิ่มเติมหรือเลือกในแพ็กเกจ)
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: ดึงรายการอาหารทั้งหมดที่เปิดให้บริการ
 *     tags: [Products]
 *     description: ดึง MenuItem ทั้งหมดที่ available = true (ใช้สำหรับเพิ่มอาหารหรือดูเมนู)
 *     responses:
 *       200:
 *         description: สำเร็จ - รายการอาหารทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "67a1b2c3d4e5f6789abcdef0"
 *                   name:
 *                     type: string
 *                     example: "ยำวุ้นเส้นทะเล"
 *                   description:
 *                     type: string
 *                     example: "ยำวุ้นเส้นรวมทะเล รสแซ่บ"
 *                   price:
 *                     type: number
 *                     example: 180
 *                   category:
 *                     type: string
 *                   available:
 *                     type: boolean
 *                     example: true
 *                   imageUrl:
 *                     type: string
 *                     nullable: true
 *                     example: "https://example.com/images/yum-woon-sen.jpg"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: เกิดข้อผิดพลาดเซิร์ฟเวอร์
 */

router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find({ available: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
