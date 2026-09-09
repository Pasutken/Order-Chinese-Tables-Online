const express = require("express");
const DrinkSet = require("../model/drinkset.js");
const DrinkCategory = require("../model/drinkCategory.js");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Drinks
 *     description: เครื่องดื่มและเซ็ตเครื่องดื่ม
 */

/**
 * @swagger
 * /api/drink-sets:
 *   get:
 *     summary: ดึงเซ็ตเครื่องดื่มทั้งหมด
 *     tags: [Drinks]
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
 *                   name: { type: string, example: "SET A" }
 *                   pricePerTable: { type: number, example: 99 }
 *                   drinks:
 *                     type: array
 *                     items: { type: string }
 */

// GET /api/drink-sets
router.get("/drink-sets", async (req, res) => {
  try {
    const sets = await DrinkSet.find({}).sort({ pricePerTable: 1 });
    res.json(sets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/drink-categories:
 *   get:
 *     summary: ดึงหมวดหมู่เครื่องดื่ม (เช่น น้ำอัดลม, น้ำเปล่า, ชา/กาแฟ)
 *     tags: [Drinks]
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
 *                   name: { type: string, example: "น้ำอัดลม" }
 *                   displayOrder: { type: number }
 */

// GET /api/drink-categories
router.get("/drink-categories", async (req, res) => {
  try {
    const categories = await DrinkCategory.find({}).sort({
      displayOrder: 1,
      name: 1,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;