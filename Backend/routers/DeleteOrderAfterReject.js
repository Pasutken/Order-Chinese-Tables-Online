const router = require("express").Router();
const Record = require("../model/recordrecModel");

router.put("/DeleteOrderafterReject/:Cid", async (req, res) => {
  try {
    const { Cid } = req.params;
    console.log("Rejecting Change for Cid:", Cid);

    // 1. ค้นหา Record
    const record = await Record.findOne({ cid: Cid });

    if (!record) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    // 2. ลบข้อมูลการขอเปลี่ยนแปลงทิ้ง (ไม่บันทึกข้อมูลใหม่)
    record.changeRequest = undefined;

    // 3. เปลี่ยนสถานะกลับเป็นสถานะเดิม (เช่น in-progress)
    // หรือถ้าอยากยกเลิก ให้ใช้สถานะ "cancelled"
    record.status = "in-progress";

    // 4. บันทึกข้อมูล
    const updatedRecord = await record.save();

    res.status(200).json({
      detail: updatedRecord,
      message: "ปฏิเสธคำขอเรียบร้อยแล้ว (กลับไปใช้ข้อมูลเดิม)",
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
