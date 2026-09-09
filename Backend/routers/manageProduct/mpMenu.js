const express = require('express');
const router = express.Router();
const multer = require('multer');
const MenuItem = require('../../model/Menumodel')
const categoryMenu = require('../../model/categoryMenu')
const path = require('path');
const UPLOADS_PATH = path.join(__dirname, '../../uploads');
const fs = require('fs');

// --- ตั้งค่า Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH ); // 1. บอกว่าให้เก็บไฟล์ในโฟลเดอร์ 'uploads'
  },
  filename: (req, file, cb) => {
    // 1. สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำ (ใช้เวลาปัจจุบัน)
    const newFilename = Date.now();
    
    // 2. ดึงนามสกุลไฟล์ (เช่น .jpg, .png) จาก "ชื่อเดิม"
    const extension = path.extname(file.originalname); 

    // 3. รวมกันเป็นชื่อใหม่ (เช่น 1761425551305.jpg)
    cb(null, newFilename + extension);
  }
});
const upload = multer({ storage: storage });

// ----------------------

/**
 * @swagger
 * /api/mpmenu/editmenus/{id}:
 *   put:
 *     summary: Update a menu item (including optional image upload)
 *     tags: [manageMenu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Menu item name
 *               price:
 *                 type: number
 *                 description: Menu item price
 *               description:
 *                 type: string
 *                 description: Menu item description
 *               category:
 *                 type: string
 *                 description: Category ID
 *               imageFile:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file to upload
 *               imageUrl:
 *                 type: string
 *                 description: Existing image URL (used if no new file is uploaded)
 *     responses:
 *       200:
 *         description: Successfully updated menu item
 *       500:
 *         description: Server error while updating menu item
 */

// 3. แก้ไข Route PUT
// ใช้ 'upload.single('imageFile')' <-- 'imageFile' ต้องตรงกับ key ใน FormData
router.put('/editmenus/:id', upload.single('imageFile'), async (req, res) => {
  try {
    const dataToUpdate = {
      name: req.body.name,   // ข้อมูล text จะอยู่ใน req.body
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    };
    // 4. เช็กว่ามีการอัพโหลดไฟล์ใหม่หรือไม่
    if (req.file) {
      // req.file คือข้อมูลไฟล์ที่อัพโหลดโดย multer
      dataToUpdate.imageUrl = `uploads/${req.file.filename}`; // 5. เก็บ "path" ของไฟล์ลง DB
    } else {
      // 6. ถ้าไม่มีไฟล์ใหม่ (แค่แก้ text)
      dataToUpdate.imageUrl = req.body.imageUrl; // ใช้ URL เก่าที่ส่งมาจาก frontend
    }
    // 7. บันทึกลง MongoDB...
    const updatedMenu = await MenuItem.findByIdAndUpdate(req.params.id, dataToUpdate, { new: true });
    res.json(updatedMenu);

  } catch (err) {
    res.status(500).send(err);
    console.log(err)
  }
});

/**
 * @swagger
 * /api/mpmenu/getmenus:
 *   get:
 *     summary: Get all menu items
 *     tags: [manageMenu]
 *     responses:
 *       200:
 *         description: Successfully fetched all menu items
 *       500:
 *         description: Server error while fetching menu items
 */
router.get('/getmenus', async (req,res)=>{
    try{
        const menus = await MenuItem.find({})
        res.status(200).json(menus)
    }catch(err){
        res.status(500).json({message: err.message})
    }
})

/**
 * @swagger
 * /api/mpmenu/deletemenu/{id}:
 *   delete:
 *     summary: Delete a menu item by ID (including optional image file deletion)
 *     tags: [manageMenu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID to delete
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error while deleting menu
 */
router.delete('/deletemenu/:id',async (req,res) => {
  try {
    // 2. ค้นหาและลบเอกสารออกจาก MongoDB
    // (findByIdAndDelete จะหาและลบในขั้นตอนเดียว และคืนค่าเอกสารที่ลบแล้วกลับมา)
    const deletedMenu = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedMenu) {
      // 3. ถ้าไม่เจอ ID นี้ใน DB
      return res.status(404).json({ message: 'Menu not found' });
    }

    // 4. ดึง path ของรูปภาพ (เช่น "uploads/12345.jpg")
    const imagePath = deletedMenu.imageUrl;

    // 5. เช็กว่าเมนูนี้มีรูปภาพหรือไม่ (บางเมนูอาจไม่มี)
    if (imagePath) {
      // 6. (สำคัญ) สร้าง Path แบบเต็ม (Absolute Path) ไปยังไฟล์
      // (อ้างอิงจากตำแหน่งไฟล์ mpMenu.js ที่ต้องถอย 2 ขั้นไปที่ root)
      const fullPath = path.join(__dirname, '../../', imagePath);

      // 7. สั่งลบไฟล์ออกจาก Server
      fs.unlink(fullPath, (err) => {
        if (err) {
          // ไม่ต้องหยุด Server แค่ log ไว้ว่าลบไม่สำเร็จ
          // (เช่น ไฟล์อาจจะไม่มีอยู่แล้ว)
          console.error('Error deleting image file:', err);
        } else {
          console.log('Successfully deleted image file:', fullPath);
        }
      });
    }

    // 8. ส่งข้อความยืนยันกลับไปให้ Frontend
    res.json({ message: 'Menu deleted successfully', deletedItem: deletedMenu });

  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err)
  }
})

/**
 * @swagger
 * /api/mpmenu/addmenus:
 *   post:
 *     summary: Add a new menu item (with optional image upload)
 *     tags: [manageMenu]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Menu item name
 *               price:
 *                 type: number
 *                 description: Menu item price
 *               description:
 *                 type: string
 *                 description: Menu item description
 *               category:
 *                 type: string
 *                 description: Category ID for the menu item
 *               imageFile:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file to upload
 *     responses:
 *       201:
 *         description: Successfully created new menu item
 *       500:
 *         description: Server error while creating menu item
 */
router.post('/addmenus', upload.single('imageFile'), async (req, res) => {
  try {
    // 1. สร้าง object ข้อมูลใหม่จาก req.body
    const newData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
      // (คุณอาจจะเพิ่ม field อื่นๆ จาก schema ที่นี่ เช่น category)
    };

    console.log(newData)
    // 2. เช็กว่ามีไฟล์อัปโหลดมาหรือไม่
    if (req.file) {
      // 3. ถ้ามี ให้เพิ่ม imageUrl (ต้องตรงกับชื่อ field ใน schema)
      newData.imageUrl = `uploads/${req.file.filename}`;
    }
    // (ถ้าไม่มีไฟล์ ก็ไม่ต้องทำอะไร Mongoose จะใช้ค่า default 'null' ตาม schema)

    // 4. (สำคัญ) ใช้ .create() เพื่อสร้างเอกสารใหม่
    const newMenu = await MenuItem.create(newData);

    // 5. ส่งสถานะ 201 (Created) พร้อมข้อมูลใหม่กลับไป
    res.status(201).json(newMenu);

  } catch (err) {
    if(err.code === 11000){
      res.status(500).json({ message: "ชื่อเมนูซ้ำ" })
    }
    res.status(500).json({ message: err.message }); // (ควรส่งเป็น .json)
    console.log(err);
  }
});

/**
 * @swagger
 * /api/mpmenu/getmenucategory:
 *   get:
 *     summary: Get all menu categories
 *     tags: [manageMenuCategory]
 *     responses:
 *       200:
 *         description: Successfully fetched all menu categories
 *       500:
 *         description: Server error while fetching menu categories
 */
router.get('/getmenucategory', async (req,res) => {
  try{
    const menucategory = await categoryMenu.find()
    res.status(200).json(menucategory)
  }catch(err){
    console.log("Error getmenucategory", err)
    res.status(500).json({ message: err.message });
  }
})

module.exports = router