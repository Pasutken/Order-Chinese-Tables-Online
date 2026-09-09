const express = require('express');
const router = express.Router();

// 1. Import Models (ต้องสร้างไฟล์ Model แยก)
const DrinkCategory = require('../../model/drinkCategory');
const DrinkSet = require('../../model/drinkSet');

// --- 1. API สำหรับ "หมวดหมู่และรายการ" (Category & Items) ---

/**
 * @swagger
 * /api/mpdrink/categories:
 *   get:
 *     summary: Get all drink categories
 *     tags: [manageDrinkCategory]
 *     responses:
 *       200:
 *         description: Successful response with all drink categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error while fetching categories
 */

// GET (Read) - ดึงทุกหมวดหมู่ (พร้อม items ที่ฝังอยู่)
router.get('/categories', async (req, res) => {
  try {
    const categories = await DrinkCategory.find({}).sort('displayOrder name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mpdrink/category:
 *   post:
 *     summary: Create a new drink category
 *     tags: [manageDrinkCategory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ชื่อหมวดหมู่เครื่องดื่ม"
 *               displayOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: Successfully created new category
 *       400:
 *         description: Failed to create category
 */
// POST (Create) - สร้างหมวดหมู่ใหม่
router.post('/category', async (req, res) => {
  try {
    const { name, displayOrder } = req.body;
    const newCategory = new DrinkCategory({ name, displayOrder });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mpdrink/category/{id}:
 *   put:
 *     summary: Update drink category by ID
 *     tags: [manageDrinkCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ชื่อหมวดหมู่เครื่องดื่มใหม่"
 *               displayOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully updated category
 *       404:
 *         description: Category not found
 *       400:
 *         description: Failed to update category
 */

// PUT (Update) - แก้ไขชื่อหมวดหมู่
router.put('/category/:id', async (req, res) => {
  try {
    const { name, displayOrder } = req.body;
    const updatedCategory = await DrinkCategory.findByIdAndUpdate(
      req.params.id,
      { name, displayOrder },
      { new: true } 
    );
    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mpdrink/category/{id}:
 *   delete:
 *     summary: Delete drink category by ID
 *     tags: [manageDrinkCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to delete
 *     responses:
 *       200:
 *         description: Drink category deleted
 *       400:
 *         description: "ไม่สามารถลบได้: ยังมีรายการเครื่องดื่มในหมวดหมู่นี้"
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */

// DELETE (Delete) - ลบหมวดหมู่ (ถ้าไม่มี items)
router.delete('/category/:id', async (req, res) => {
  try {
    const category = await DrinkCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (category.items.length > 0) {
      return res.status(400).json({ message: 'ไม่สามารถลบได้: ยังมีรายการเครื่องดื่มในหมวดหมู่นี้' });
    }
    await category.deleteOne();
    res.json({ message: 'Drink category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- (API สำหรับ "Items" ที่ฝังอยู่) ---
/**
 * @swagger
 * /api/mpdrink/category/{id}/item:
 *   post:
 *     summary: Add a new drink item to a category
 *     tags: [manageDrinkCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to add item into
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Drink item data
 *     responses:
 *       201:
 *         description: Successfully added item to category
 *       404:
 *         description: Category not found
 *       400:
 *         description: Failed to add item
 */
// POST (Create) - เพิ่ม Item ใน Category
router.post('/category/:id/item', async (req, res) => {
  try {
    const category = await DrinkCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // สร้าง item ใหม่ (จาก req.body) แล้ว push เข้า array
    category.items.push(req.body); 
    await category.save();
    res.status(201).json(category); // ส่ง category ที่อัปเดตแล้วกลับไป
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mpdrink/category/{id}/item/{itemId}:
 *   put:
 *     summary: Update a drink item inside a category
 *     tags: [manageDrinkCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID inside the category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Updated drink item data
 *     responses:
 *       200:
 *         description: Successfully updated item
 *       404:
 *         description: Category or item not found
 *       400:
 *         description: Failed to update item
 */
// PUT (Update) - แก้ไข Item ใน Category
router.put('/category/:id/item/:itemId', async (req, res) => {
  try {
    const category = await DrinkCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // หา item ย่อยด้วย .id()
    const item = category.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // อัปเดตค่า
    item.set(req.body); 
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mpdrink/category/{id}/item/{itemId}:
 *   delete:
 *     summary: Delete a drink item from a category
 *     tags: [manageDrinkCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID to delete
 *     responses:
 *       200:
 *         description: Successfully deleted item from category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
// DELETE (Delete) - ลบ Item ออกจาก Category
router.delete('/category/:id/item/:itemId', async (req, res) => {
  try {
    const category = await DrinkCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // ลบ item ย่อยออกจาก array
    category.items.id(req.params.itemId).deleteOne();
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. API สำหรับ "เซ็ตเครื่องดื่ม" (Drink Sets) ---

/**
 * @swagger
 * /api/mpdrink/sets:
 *   get:
 *     summary: Get all drink sets
 *     tags: [manageDrinkSet]
 *     responses:
 *       200:
 *         description: Successfully fetched all drink sets
 *       500:
 *         description: Server error while fetching drink sets
 */
// (นี่คือ CRUD มาตรฐาน)
router.get('/sets', async (req, res) => {
  try {
    const sets = await DrinkSet.find({});
    res.json(sets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/**
 * @swagger
 * /api/mpdrink/set:
 *   post:
 *     summary: Create a new drink set
 *     tags: [manageDrinkSet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Drink set data
 *     responses:
 *       201:
 *         description: Successfully created new drink set
 *       400:
 *         description: Failed to create drink set
 */
router.post('/set', async (req, res) => {
  try {
    const newSet = new DrinkSet(req.body);
    await newSet.save();
    res.status(201).json(newSet);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/**
 * @swagger
 * /api/mpdrink/set/{id}:
 *   put:
 *     summary: Update a drink set by ID
 *     tags: [manageDrinkSet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Drink set ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Updated drink set data
 *     responses:
 *       200:
 *         description: Successfully updated drink set
 *       404:
 *         description: Set not found
 *       400:
 *         description: Failed to update drink set
 */
router.put('/set/:id', async (req, res) => {
  try {
    const updatedSet = await DrinkSet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSet) return res.status(404).json({ message: 'Set not found' });
    res.json(updatedSet);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/**
 * @swagger
 * /api/mpdrink/set/{id}:
 *   delete:
 *     summary: Delete a drink set by ID
 *     tags: [manageDrinkSet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Drink set ID to delete
 *     responses:
 *       200:
 *         description: Drink set deleted
 *       404:
 *         description: Set not found
 *       500:
 *         description: Server error
 */
router.delete('/set/:id', async (req, res) => {
  try {
    const deletedSet = await DrinkSet.findByIdAndDelete(req.params.id);
    if (!deletedSet) return res.status(404).json({ message: 'Set not found' });
    res.json({ message: 'Drink set deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;