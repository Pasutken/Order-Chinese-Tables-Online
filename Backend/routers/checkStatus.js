const router = require("express").Router();
const Record = require("../model/recordrecModel");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/checkstatus:
 *   get:
 *     summary: ดึงข้อมูล Record ทั้งหมดของผู้ใช้ (Check Status)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 record:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: "ข้อมูล Record แต่ละรายการ"
 *       500:
 *         description: Server Error
 */

router.get("/checkstatus", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const record = await Record.find({ uid: userId });
    res.status(200).json({ record });
  } catch (err) {
    res.status(500).json({ message: "server Error" });
    console.log(err);
  }
});

module.exports = router;
