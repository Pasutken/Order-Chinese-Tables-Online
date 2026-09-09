const express = require('express');
const router = express.Router();
const categoryPackage = require('../../model/categoryPackage')
const Package = require('../../model/packagemodel')
const mongoose = require("mongoose")

/**
 * @swagger
 * /api/mpmain/getpackagecategory:
 *    get:
 *        summary: Get all package category
 *        tags: [managePackageCategory]
 *        responses:
 *            200:
 *               description: Successful response
 *            500:
 *               description: Error getting categories
 */
router.get("/getpackagecategory", async (req, res) => {
    try {
    const result = await categoryPackage.find({}).lean();
    res.json(result);
  } catch (err) {
    console.error("Error fetching package categories:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่" });
  }
})

/**
 * @swagger
 * /api/mpmain/addpackagecategory:
 *    post:
 *        summary: Create new package category
 *        tags: [managePackageCategory]
 *        requestBody:
 *            content:
 *                application/json:
 *                    schema:
 *                        type: object
 *                        properties:
 *                            categoryName:
 *                                type: string
 *                                example: "ไม่บอก"
 *                          
 *        responses:
 *            201:
 *                description: เพิ่มหมวดหมู่สำเร็จ
 *            500:
 *                description: เพิ่มหมวดหมู่ล้มเหลว
 */
router.post("/addpackagecategory", async(req,res) => {
  try{
    const category = req.body
    const newCategory = await categoryPackage.create(category)
    res.status(201).json(newCategory)
  }catch(err){
    console.log("Error addpackagecategory", err)
    res.status(500).json({ message: "เพิ่มหมวดหมู่ล้มเหลว"});
  }
})

/**
 * @swagger
 * /api/mpmain/updatepackagecategory/{categoryid}:
 *   put:
 *     summary: Update package category by ID
 *     tags: [managePackageCategory]
 *     parameters:
 *       - in: path
 *         name: categoryid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the package category to update
 *       - in: body
 *         name: category
 *         required: true
 *         description: Category data to update
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "ชื่อหมวดหมู่แพ็คเกจ"
 *     responses:
 *       200:
 *         description: Successfully updated category
 *       500:
 *         description: อัพเดตหมวดหมู่ล้มเหลว
 */
router.put("/updatepackagecategory/:categoryid", async(req,res) => {
  try{
    const { categoryid } = req.params
    const category = req.body
    const updateCategory = await categoryPackage.findOneAndUpdate({_id: categoryid},category,{ new: true, runValidators: true })
    res.status(200).json(updateCategory)
  }catch(err){
    console.log("Error updatepackagecategory", err)
    res.status(500).json({ message: "อัพเดตหมวดหมู่ล้มเหลว"});
  }
})

/**
 * @swagger
 * /api/mpmain/deletepackagecategory/{categoryid}:
 *   delete:
 *     summary: Delete package category by ID (with transaction)
 *     tags: [managePackageCategory]
 *     parameters:
 *       - in: path
 *         name: categoryid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the package category to delete
 *     responses:
 *       200:
 *         description: ลบหมวดหมู่สำเร็จ และตัดการเชื่อมโยงแพ็คเกจทั้งหมดที่อยู่ในหมวดหมู่นั้น
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCategory:
 *                   type: object
 *       500:
 *         description: ลบหมวดหมู่ล้มเหลว
 */
router.delete("/deletepackagecategory/:categoryid", async (req, res) => {
  const { categoryid } = req.params;

  try {
    // 1. อัปเดต "ลูก" ทั้งหมด (แพ็คเกจ) ให้ category เป็น null
    // ไม่ต้องส่ง { session } เข้าไปแล้ว
    const packageUpdateResult = await Package.updateMany(
      { category: categoryid },
      { $set: { category: null } }
    );

    // 2. ลบ "แม่" (หมวดหมู่)
    // ไม่ต้องส่ง { session } เข้าไปแล้ว
    const deletedCategory = await categoryPackage.findByIdAndDelete(categoryid);

    if (!deletedCategory) {
      // ถ้าหาไม่เจอ ให้ throw error ไปที่ catch
      throw new Error("ไม่พบหมวดหมู่ที่ต้องการลบ");
    }

    res.status(200).json({
      message: `ลบหมวดหมู่สำเร็จ (และตัดการเชื่อมโยง ${packageUpdateResult.modifiedCount} แพ็คเกจ)`,
      deletedCategory: deletedCategory,
    });

  } catch (err) {
    console.log("Error deletepackagecategory", err);
    res.status(500).json({ message: "ลบหมวดหมู่ล้มเหลว", error: err.message });
  }
});

module.exports = router;