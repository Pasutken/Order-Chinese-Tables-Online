const express = require("express");
const router = express.Router();
const Package = require("../../model/packagemodel");
const { findOneAndDelete } = require("../../model/usermodel");

/**
 * @swagger
 * /api/mppackage/getpackage:
 *   get:
 *     summary: Get all packages
 *     tags: [managePackage]
 *     responses:
 *       200:
 *         description: Successfully fetched all packages
 *       500:
 *         description: Server error while fetching packages
 */
router.get("/getpackage", async (req, res) => {
  try {
    const package = await Package.find();
    res.status(200).json(package);
  } catch (err) {
    console.log("Error getpackage", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mppackage/getonepackage/{packageid}:
 *   get:
 *     summary: Get a single package by ID
 *     tags: [managePackage]
 *     parameters:
 *       - in: path
 *         name: packageid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the package to retrieve
 *     responses:
 *       200:
 *         description: Successfully fetched the package
 *       500:
 *         description: Server error while fetching the package
 */
router.get("/getonepackage/:packageid", async (req, res) => {
  try {
    const { packageid } = req.params;
    const packageData = await Package.findOne({ _id: packageid });
    res.status(200).json(packageData);
  } catch (err) {
    console.log("Error getonepackage", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mppackage/addpackage:
 *   post:
 *     summary: Add a new package
 *     tags: [managePackage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Package data to create
 *     responses:
 *       201:
 *         description: Successfully created new package
 *       500:
 *         description: Server error while creating package
 */
router.post("/addpackage", async (req, res) => {
  try {
    const packageData = req.body;
    const newPackage = await Package.create(packageData);
    res.status(201).json(newPackage);
    console.log("susscess");
  } catch (err) {
    console.error("Error creating package:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/mppackage/editpackage/{packageid}:
 *   put:
 *     summary: Update a package by ID
 *     tags: [managePackage]
 *     parameters:
 *       - in: path
 *         name: packageid
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Updated package data
 *     responses:
 *       200:
 *         description: Successfully updated the package
 *       404:
 *         description: Package not found
 *       500:
 *         description: Server error while updating package
 */
router.put("/editpackage/:packageid", async (req, res) => {
  try {
    const { packageid } = req.params;
    const newPackageData = req.body;
    const updatePackage = await Package.findOneAndUpdate(
      { _id: packageid },
      newPackageData,
      { new: true, runValidators: true }
    );
    if (!updatePackage) {
      return res.status(404).json({ message: "ไม่พบแพ็คเกจที่จะอัปเดต" });
    }
    res.status(200).json(updatePackage);
  } catch (err) {
    console.log("Error editpackage", err);
    res.status(500).json({ message: err.message });
  }
});


/**
 * @swagger
 * /api/mppackage/deletepackage/{packageid}:
 *   delete:
 *     summary: Delete a package by ID
 *     tags: [managePackage]
 *     parameters:
 *       - in: path
 *         name: packageid
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ลบแพ็คเกจสำเร็จ
 *                 data:
 *                   type: object
 *                   description: The deleted package object
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ไม่พบแพ็คเกจที่ต้องการลบ
 *       500:
 *         description: Server error while deleting package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.delete("/deletepackage/:packageid", async (req, res) => {
  try {
    const { packageid } = req.params;
    console.log(packageid);

    // 1. ต้องมี await เพื่อรอให้ Database ลบเสร็จก่อน
    const deletedPkg = await Package.findOneAndDelete({ _id: packageid });

    // 2. เช็คว่าเจอมั้ย (ถ้า deletedPkg เป็น null แปลว่าหา ID ไม่เจอ)
    if (!deletedPkg) {
      return res.status(404).json({ message: "ไม่พบแพ็คเกจที่ต้องการลบ" });
    }

    // 3. ส่ง response กลับไป (ส่ง object ธรรมดา ไม่ error circular แน่นอน)
    res.status(200).json({ 
        message: "ลบแพ็คเกจสำเร็จ", 
        data: deletedPkg // ส่งข้อมูลตัวที่ลบไปให้หน้าบ้านดูด้วยก็ได้ (Optional)
    });

  } catch (err) {
    console.log("Error deletepackage", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;