const exxpress = require("express");
const router = exxpress.Router();
const Record = require("../model/recordrecModel");


router.get("/Dashboard_DataOrderInYear", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfYear = new Date(today.getFullYear(), 0, 1);
    

    // นับ order ในปีนี้
    const ordersThisYear = await Record.countDocuments({
      createdAt: { $gte: startOfYear },
    });

    res.status(200).json({
      orderInYear: ordersThisYear,
      message: "Success",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/Dashboard_DataOrderByMonth", async (req, res) => {
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const currentMonthIndex = today.getMonth(); // 0 = มกราคม, 1 = กุมภาพันธ์, ...

    // 1. ใช้ Aggregation Pipeline เพื่อ $match (กรอง) และ $group (จัดกลุ่ม)
    const dbResults = await Record.aggregate([
      {
        // $match: กรองเอาเฉพาะเอกสารในปีนี้
        $match: {
          createdAt: { $gte: startOfYear },
        },
      },
      {
        // $group: จัดกลุ่มตามเดือน และนับจำนวน
        $group: {
          _id: { $month: "$createdAt" }, // จัดกลุ่มด้วย "เดือน" (1 = ม.ค., 2 = ก.พ., ...)
          count: { $sum: 1 }, // นับจำนวนเอกสารในแต่ละกลุ่ม
        },
      },
      {
        // $sort: เรียงลำดับตามเดือน
        $sort: { _id: 1 },
      },
    ]);

    // 2. เตรียมข้อมูล 12 เดือน (ตามรูปแบบที่คุณต้องการ)
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    ];

    // 3. สร้างอาร์เรย์ข้อมูล 12 เดือน โดยตั้งค่าเริ่มต้น
    const monthlyData = thaiMonths.map((monthName, index) => {
      let countValue;
      if (index > currentMonthIndex) {
        // ถ้าเป็นเดือนในอนาคต ให้เป็น null
        countValue = null;
      } else {
        // ถ้าเป็นเดือนปัจจุบันหรืออดีต ให้เป็น 0 (รอการอัปเดต)
        countValue = 0;
      }
      
      // ใช้ key 'orderAmount' เพื่อให้ตรงกับตัวอย่าง graphData ของคุณ
      return {
        month: monthName,
        orderAmount: countValue, 
      };
    });

    // 4. นำผลลัพธ์จาก DB (dbResults) มาใส่ในอาร์เรย์ 12 เดือน
    for (const result of dbResults) {
      // result._id คือเลขเดือน (1-12)
      // index ของอาร์เรย์คือ (0-11)
      const monthIndex = result._id - 1;

      if (monthIndex >= 0 && monthIndex < 12) {
        // อัปเดตค่า count จาก 0 เป็นค่าจริงที่ได้จาก DB
        monthlyData[monthIndex].orderAmount = result.count;
      }
    }

    // 5. ส่งข้อมูลที่จัดรูปแบบแล้วกลับไป
    res.status(200).json({
      ordersByMonth: monthlyData, // นี่คืออาร์เรย์ 12 เดือน
      message: "Success",
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;