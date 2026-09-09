const express = require("express");
const Packages = require("../model/packagemodel");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Menus
 *     description: แพ็กเกจอาหารและรายละเอียดเมนู
 */

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: ดึงรายการแพ็กเกจทั้งหมด (แสดงแค่ราคาและ ID)
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   price: { type: number, example: 8990 }
 */

// GET /api/menus (เหมือนเดิม)
router.get("/", async (req, res) => {
  try {
    const menus = await Packages.find({})
      .select("_id price")
      .sort({ price: 1 });
    res.json(menus);
  } catch (err) {
    console.error("Menu list route error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/menus/getpackages:
 *   get:
 *     summary: ดึงข้อมูลแพ็กเกจแบบเต็ม (สำหรับหน้าเลือกแพ็กเกจ)
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Package'
 */

// GET /api/menus/getpackages
router.get("/getpackages", async (req, res) => {
  try {
    const packages = await Packages.find({});
    console.log(packages);
    res.json({
      message: "Successfully triggered 'Packages' collection creation.",
      count: packages.length,
      data: packages, // <-- data.data ที่ Topbar เรียกใช้
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/menus/{id}:
 *   get:
 *     summary: ดึงรายละเอียดแพ็กเกจตาม ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId ของแพ็กเกจ
 *     responses:
 *       200:
 *         description: "สำเร็จ (จะกรองเฉพาะเมนูที่ available: true)"
 *       404:
 *         description: ไม่พบแพ็กเกจ
 */

// GET /api/menus/:id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const menu = await Packages.findById(id).populate({
      path: "dishes.group.menuItem",
      select: "name imageUrl available",
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // (โค้ดส่วนที่เหลือเหมือนเดิม)
    const menuWithAvailableItems = JSON.parse(JSON.stringify(menu));
    menuWithAvailableItems.dishes.forEach((groupRow) => {
      groupRow.group = groupRow.group.filter(
        (dish) => dish.menuItem && dish.menuItem.available
      );
    });

    res.json(menuWithAvailableItems);
  } catch (err) {
    console.error("Menu route error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;