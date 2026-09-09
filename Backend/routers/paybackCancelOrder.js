const express = require("express");
const router = express.Router();
const Record = require("../model/recordrecModel");

router.get("/allcancelorder", async (req, res) => {
  try {
    const records = await Record.find({
      status: "cancelled",
      payback: { $exists: true }, // ย้ายมาตรงนี้
    }).sort({ createdAt: -1 }); // (แนะนำ) เรียงจากล่าสุดไปเก่าสุด

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/paybackcheck/:id", async (req, res) => {
  try {
    const { id } = req.params; // 1. ดึง id ออกมาให้ถูกต้อง

    const record = await Record.findByIdAndUpdate(
      id,
      { $unset: { payback: "" } }, // 2. ใช้ $unset เพื่อลบ field payback ทิ้ง
      { new: true } // 3. คืนค่าข้อมูลล่าสุดหลังลบเสร็จแล้ว
    );

    if (!record) {
      return res.status(404).json({ message: "ไม่พบรายการ" });
    }

    res.status(200).json({ message: "ลบ payback เรียบร้อย", record });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
