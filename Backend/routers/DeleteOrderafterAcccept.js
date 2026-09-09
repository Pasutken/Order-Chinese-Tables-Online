const router = require('express').Router();
const Record = require("../model/recordrecModel");


router.put("/DeleteOrderafterAcccept/:Cid", async (req, res) => {
  try {
    const { Cid } = req.params;
    console.log("Accepting Order Cid:", Cid);

    // 1. ค้นหา Record เดิมก่อน
    const record = await Record.findOne({ cid: Cid });

    if (!record) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    // เช็คว่ามีข้อมูลการขอเปลี่ยนแปลงไหม
    if (!record.changeRequest) {
      return res.status(400).json({ message: "ไม่พบข้อมูลการขอแก้ไข (Change Request)" });
    }

    // 2. ย้ายข้อมูลจาก changeRequest มาทับข้อมูลหลัก (Merge Data)
    // ตรงนี้ต้อง map field ให้ครบตามที่คุณต้องการเปลี่ยน
    record.WorkDate = record.changeRequest.WorkDate;
    record.WorkTime = record.changeRequest.WorkTime;
    record.totalPrice = record.changeRequest.totalPrice; // อัปเดตราคาใหม่
    record.table = record.changeRequest.table;
    record.details = record.changeRequest.details; // อัปเดตรายการอาหาร/เมนู
    
    // อัปเดตที่อยู่ (ถ้ามีการเปลี่ยน)
    if (record.changeRequest.address) {
        record.address = record.changeRequest.address;
    }

    // 3. เปลี่ยนสถานะกลับมาเป็นปกติ
    record.status = "in-progress"; 

    // 4. ลบข้อมูล changeRequest ออก (เคลียร์ค่าทิ้ง)
    record.changeRequest = undefined;

    // 5. บันทึกลงฐานข้อมูล
    const updatedRecord = await record.save();

    res.status(200).json({
      detail: updatedRecord,
      message: "อนุมัติการแก้ไขเรียบร้อยแล้ว (ข้อมูลถูกอัปเดต)",
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;