const express = require("express");
const multer = require("multer");
const path = require("path");
const Record = require("../model/recordrecModel.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

// --- Multer Setup (เหมือนเดิม) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/slips/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("รองรับเฉพาะไฟล์ .png, .jpg และ .jpeg เท่านั้น"));
    }
  },
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - address
 *         - city
 *         - province
 *         - zipcode
 *       properties:
 *         address:
 *           type: string
 *           example: "123/45 หมู่ 2 ถนนพระราม 9"
 *         city:
 *           type: string
 *           example: "ห้วยขวาง"
 *         province:
 *           type: string
 *           example: "กรุงเทพมหานคร"
 *         zipcode:
 *           type: string
 *           example: "10310"
 *
 *     ChangeRequest:
 *       type: object
 *       properties:
 *         WorkDate:
 *           type: string
 *           format: date
 *           example: "2025-12-25"
 *         WorkTime:
 *           type: string
 *           example: "18:00"
 *         totalPrice:
 *           type: number
 *           example: 18500
 *         table:
 *           type: number
 *           example: 15
 *         details:
 *           type: object
 *           description: "รายละเอียดแพ็กเกจและเมนูใหม่ (โครงสร้างเดียวกับ details หลัก)"
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         priceDifference:
 *           type: number
 *           description: "ส่วนต่างราคา (บวก = จ่ายเพิ่ม, ลบ = คืนเงิน)"
 *           example: 2500
 *         requestDate:
 *           type: string
 *           format: date-time
 *
 *     Record:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67a9b123c456d789e0123456"
 *         cid:
 *           type: string
 *           description: "รหัสการจอง เช่น 251116001"
 *           example: "251116001"
 *         uid:
 *           type: string
 *           description: "User ID ของลูกค้า"
 *         username:
 *           type: string
 *           example: "สมชาย"
 *         lastname:
 *           type: string
 *           example: "ใจดี"
 *         phone:
 *           type: string
 *           example: "0812345678"
 *         WorkDate:
 *           type: string
 *           format: date
 *           example: "2025-12-25"
 *         WorkTime:
 *           type: string
 *           example: "18:00"
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         table:
 *           type: number
 *           description: "จำนวนโต๊ะ"
 *           example: 12
 *         details:
 *           type: object
 *           description: "รายละเอียดแพ็กเกจ เมนู อาหารเพิ่ม เซ็ตเครื่องดื่ม ฯลฯ"
 *         totalPrice:
 *           type: number
 *           example: 16000
 *         status:
 *           type: string
 *           enum:
 *             - pending
 *             - confirmed
 *             - in-progress
 *             - completed
 *             - cancelled
 *             - Order-Change-Processing
 *           default: pending
 *         payment:
 *           type: string
 *           enum: [unpaid, paid, refunded]
 *           default: unpaid
 *         paymentSlipUrl:
 *           type: string
 *           nullable: true
 *           example: "uploads/slips/slip-1731750000000-123456789.jpg"
 *         payback:
 *           type: number
 *           nullable: true
 *           description: "ยอดเงินที่ต้องคืนเมื่อยกเลิก"
 *           example: 8000
 *         changeRequest:
 *           oneOf:
 *             - type: "null"
 *             - $ref: '#/components/schemas/ChangeRequest'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - cid
 *         - uid
 *         - username
 *         - phone
 *         - WorkDate
 *         - WorkTime
 *         - totalPrice
 *
 *     Package:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "แพ็กเกจทอง"
 *         maxprice:
 *           type: number
 *           example: 25000
 *         minprice:
 *           type: number
 *           example: 18000
 *         dishes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               group:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItem:
 *                       type: string
 *                       description: "ObjectId ของ MenuItem"
 *         category:
 *           type: string
 *           description: "ObjectId ของหมวดหมู่"
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Booking
 *     description: การจอง, แก้ไข, ยกเลิก
 *   - name: Payment
 *     description: การชำระเงินและอัปโหลดสลิป
 */

/**
 * @swagger
 * /api/my-bookings:
 *   get:
 *     summary: ดึงรายการจองทั้งหมดของฉัน
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *       500:
 *         description: Server error
 */

// GET /api/my-bookings/:userId
router.get("/my-bookings", authMiddleware, async (req, res) => {
  const id = req.user.id;
  console.log(id);
  try {
    const bookings = await Record.find({ uid: id }).sort({
      WorkDate: -1,
    });
    res.json(bookings);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึง 'my-bookings':", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาด Server ในการดึงข้อมูลการจอง" });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: สร้างการจองใหม่ (รับข้อมูลเต็ม)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactName
 *               - phone
 *               - eventDate
 *               - eventTime
 *               - grandTotal
 *             properties:
 *               contactName: { type: string }
 *               phone: { type: string }
 *               eventDate: { type: string, format: date, example: "2025-12-25" }
 *               eventTime: { type: string, example: "18:00" }
 *               grandTotal: { type: number }
 *               packageName: { type: string }
 *               tableCount: { type: number }
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *               # ... สามารถเพิ่ม field อื่น ๆ ตามที่ส่งมา
 *     responses:
 *       201:
 *         description: จองสำเร็จ (จะได้ cid แบบ YYMMDDXXX)
 *       400:
 *         description: ข้อมูลไม่ครบ
 */

// POST /api/bookings
router.post("/bookings", authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const uid = req.user.id;
    const lastname = req.user.lastname;

    // 1. สร้าง Prefix จากวันที่ปัจจุบัน (เช่น 251111)
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // เอาปี 2 หลักท้าย (25)
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // เดือน (11)
    const day = date.getDate().toString().padStart(2, "0"); // วัน (11)
    const prefix = `${year}${month}${day}`; // ผลลัพธ์: "251111"

    // 2. ค้นหา Order ล่าสุดของวันนี้ เพื่อดูลำดับล่าสุด
    const lastRecord = await Record.findOne({ cid: { $regex: `^${prefix}` } })
      .sort({ cid: -1 }) // เรียงจากมากไปน้อย
      .select("cid"); // เอามาแค่ field cid พอ

    // 3. กำหนดลำดับถัดไป
    let nextSequence = 1;
    if (lastRecord && lastRecord.cid) {
      const lastSequenceStr = lastRecord.cid.slice(-3);
      nextSequence = parseInt(lastSequenceStr) + 1;
    }
    // 4. รวมร่างเป็น CID ใหม่ (เติม 0 ข้างหน้าให้ครบ 3 หลัก)
    const newCid = `${prefix}${nextSequence.toString().padStart(3, "0")}`;

    const bookingDetails = {
      packageName: data.packageName,
      tableCount: data.tableCount,
      packagePrice: data.packagePrice,
      foodSubtotal: data.foodSubtotal,
      selectedDishes: data.selectedDishes,
      selectedAddonFoods: data.selectedAddonFoods,
      totalAddonFoodPrice: data.totalAddonFoodPrice,
      selectedDrinks: data.selectedDrinks,
      totalDrinkPrice: data.totalDrinkPrice,
      selectedDrinkSet: data.selectedDrinkSet,
      eventLocationName: data.location,
      remarks: data.remarks,
      lineId: data.lineId,
      email: data.email,
    };

    const newRecord = new Record({
      uid: uid,
      cid: newCid,
      username: data.contactName,
      lastname: lastname,
      phone: data.phone,
      WorkDate: new Date(data.eventDate),
      WorkTime: data.eventTime,
      totalPrice: data.grandTotal,
      address: {
        address: data.address.address,
        city: data.address.district,
        province: data.address.province,
        zipcode: data.address.zipCode,
      },
      details: bookingDetails,
      table: data.tableCount,
    });

    const savedRecord = await newRecord.save({ validateBeforeSave: false });
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึก Record:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "ข้อมูลไม่ถูกต้อง", errors: messages });
    }
    res
      .status(400)
      .json({ message: "บันทึกข้อมูลไม่สำเร็จ", error: error.message });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   put:
 *     summary: ขอแก้ไขรายการจอง (ยังไม่เปลี่ยนของจริงจนกว่าแอดมินอนุมัติ)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId: { type: string, description: "_id ของ Record" }
 *               eventDate: { type: string, format: date }
 *               eventTime: { type: string }
 *               grandTotal: { type: number }
 *               priceDifference: { type: number, description: "ส่วนต่างราคา (อาจติดลบได้)" }
 *               tableCount: { type: number }
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: ส่งคำขอแก้ไขสำเร็จ → สถานะเป็น Order-Change-Processing
 *       404:
 *         description: ไม่พบรายการจอง
 */

router.put("/bookings", authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const uid = req.user.id;
    const lastname = req.user.lastname;

    if (!data.bookingId) {
      return res.status(400).json({ message: "ไม่พบ ID ของรายการจอง" });
    }
    const record = await Record.findOne({ _id: data.bookingId, uid: uid });

    if (!record) {
      return res.status(404).json({ message: "ไม่พบรายการจอง" });
    }
    record.lastname = lastname;

    const newChangeRequest = {
      WorkDate: new Date(data.eventDate),
      WorkTime: data.eventTime,
      totalPrice: data.grandTotal,
      table: data.tableCount,

      address: {
        address: data.address.address,
        city: data.address.district,
        province: data.address.province,
        zipcode: data.address.zipCode,
      },

      details: {
        packageName: data.packageName,
        tableCount: data.tableCount,
        packagePrice: data.packagePrice,
        foodSubtotal: data.foodSubtotal,
        selectedDishes: data.selectedDishes,
        selectedAddonFoods: data.selectedAddonFoods,
        totalAddonFoodPrice: data.totalAddonFoodPrice,
        selectedDrinks: data.selectedDrinks,
        totalDrinkPrice: data.totalDrinkPrice,
        selectedDrinkSet: data.selectedDrinkSet,
        eventLocationName: data.location,
        remarks: data.remarks,
        lineId: data.lineId,
        email: data.email,
      },

      priceDifference: data.priceDifference || 0,
      requestDate: new Date(),
    };

    record.changeRequest = newChangeRequest;
    record.status = "Order-Change-Processing"; // เปลี่ยนสถานะเพื่อให้ Admin เห็น
    const updatedRecord = await record.save({ validateBeforeSave: false });

    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Error updating record:", error);
    res
      .status(400)
      .json({ message: "ส่งคำขอแก้ไขไม่สำเร็จ", error: error.message });
  }
});

/**
 * @swagger
 * /api/payment-confirmation:
 *   post:
 *     summary: อัปโหลดสลิปยืนยันการชำระเงิน
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - slip
 *             properties:
 *               bookingId:
 *                 type: string
 *               slip:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: อัปโหลดสลิปสำเร็จ
 *       400:
 *         description: ไม่มีไฟล์หรือ bookingId
 */

// POST /api/payment-confirmation
router.post(
  "/payment-confirmation",
  upload.single("slip"),
  async (req, res) => {
    try {
      const { bookingId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "ไม่พบไฟล์สลิป" });
      }
      if (!bookingId) {
        return res.status(400).json({ message: "ไม่พบ Booking ID" });
      }

      const record = await Record.findById(bookingId);
      if (!record) {
        return res.status(404).json({ message: "ไม่พบรายการจองนี้" });
      }
      if (record.status == "Order-Change-Processing") {
        record.status = "Order-Change-Processing";
      } else {
        record.status = "in-progress";
      }
      record.payment = "paid";
      record.paymentSlipUrl = req.file.path;

      await record.save();

      res
        .status(200)
        .json({ message: "ยืนยันการชำระเงินสำเร็จ (รอตรวจสอบ)", data: record });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปโหลดสลิป:", error);
      res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาด Server", error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/cancelBooking/{id}:
 *   put:
 *     summary: ยกเลิกรายการจอง + คำนวณเงินคืนอัตโนมัติ
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: _id ของ Record
 *     responses:
 *       200:
 *         description: ยกเลิกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 refundAmount: { type: number }
 *                 daysRemaining: { type: number }
 *       404:
 *         description: ไม่พบรายการ
 */

router.put("/cancelBooking/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. หาออเดอร์เป้าหมาย
    const order = await Record.findById(id);
    console.log("order", order);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    // 2. คำนวณระยะห่างระหว่าง "ปัจจุบัน" กับ "วันจัดงาน (WorkDate)"
    const today = new Date();
    const eventDate = new Date(order.WorkDate);

    // หาผลต่างเป็นมิลลิวินาที แล้วแปลงเป็นวัน
    const diffTime = eventDate - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 3. คำนวณเงินคืน (Payback) ตามมาตรฐาน
    let refundPercentage = 0;

    if (daysRemaining >= 30) {
      refundPercentage = 100; // ยกเลิกก่อน 30 วัน คืนเต็ม
    } else if (daysRemaining >= 15) {
      refundPercentage = 50; // ยกเลิกก่อน 15-29 วัน คืนครึ่งเดียว
    } else {
      refundPercentage = 0; // กระชั้นชิด ไม่คืนเงิน
    }

    const paybackAmount = order.totalPrice * (refundPercentage / 100);

    // 4. อัปเดตข้อมูล
    order.status = "cancelled";
    order.payback = paybackAmount; // บันทึกยอดเงินคืนเก็บไว้

    // (Optional) คุณอาจจะอยากเก็บเหตุผลการยกเลิกด้วย ถ้ามี field รองรับ
    // order.cancelReason = req.body.reason;

    await order.save({ validateBeforeSave: false });

    res.json({
      message: "ยกเลิกรายการสำเร็จ",
      refundAmount: paybackAmount,
      daysRemaining: daysRemaining,
      order: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการยกเลิกรายการ" });
  }
});

module.exports = router;