const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema(
  {
    // ข้อมูลลูกค้า
    username: {
      type: String,
      required: [true, "กรุณาระบุชื่อผู้ใช้"],
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "กรุณาระบุเบอร์โทรศัพท์"],
      trim: true,
      match: [/^[0-9]{10}$/, "เบอร์โทรศัพท์ไม่ถูกต้อง"], // ตรวจสอบรูปแบบเบอร์โทร
    },
    cid: {
      type: String,
      required: [true, "กรุณาระบุรหัสลูกค้า"],
      trim: true,
    },
    uid: {
      type: String,
      required: [true, "กรุณาระบุรหัสผู้ใช้"],
      trim: true,
      index: true, // เพิ่ม index เพื่อค้นหาเร็วขึ้น
    },

    // วันที่และเวลาทำงาน
    WorkDate: {
      type: Date,
      required: [true, "กรุณาระบุวันที่ทำงาน"],
      index: true,
    },
    WorkTime: {
      type: String,
      required: [true, "กรุณาระบุเวลาทำงาน"],
      trim: true,
    },

    // ที่อยู่
    address: {
      address: {
        type: String,
        required: [true, "กรุณาระบุที่อยู่"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "กรุณาระบุเขต/อำเภอ"],
        trim: true,
      },
      province: {
        type: String,
        required: [true, "กรุณาระบุจังหวัด"],
        trim: true,
      },
      zipcode: {
        type: String,
        required: [true, "กรุณาระบุรหัสไปรษณีย์"],
        trim: true,
        match: [/^[0-9]{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"],
      },
    },
    table:{ 
      type: Number,
      required: [true, "กรุณาระบุจำนวนโต๊ะ"],
    },

    // รายละเอียดคำสั่งซื้อ/บริการ
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "กรุณาระบุรายละเอียด"],
    },

    // สถานะ
    status: {
      type: String,
      default: "pending",
      enum: {
        values: [
          "pending",
          "confirmed",
          "in-progress",
          "completed",
          "cancelled",
          "Order-Change-Processing",
        ],
        message: "สถานะไม่ถูกต้อง",
      },
      index: true,
    },

    // การชำระเงิน
    payment: {
      type: String,
      default: "unpaid",
      enum: {
        values: ["unpaid", "paid", "refunded"],
        message: "สถานะการชำระเงินไม่ถูกต้อง",
      },
      index: true,
    },
    
    payback: {
      type: Number,
    },

    // ราคารวม
    totalPrice: {
      type: Number,
      required: [true, "กรุณาระบุราคารวม"],
      min: [0, "ราคาต้องมากกว่าหรือเท่ากับ 0"],
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    // วันที่สร้าง
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // ไม่สามารถแก้ไขได้หลังจากสร้าง
    },

    // วันที่อัปเดตล่าสุด
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    changeRequest: {
      type: new mongoose.Schema({
        WorkDate: Date,
        WorkTime: String,
        totalPrice: Number, // ราคารวมใหม่
        table: Number,
        details: mongoose.Schema.Types.Mixed, // รายละเอียดเมนูใหม่
        address: {
             address: String,
             city: String,
             province: String,
             zipcode: String
        },
        priceDifference: Number, // ส่วนต่างราคา (ถ้ามี)
        requestDate: { type: Date, default: Date.now }
      }, { _id: false }), // ไม่ต้องสร้าง _id ซ้อน
      default: null 
    },
  },
  {
    timestamps: true, // สร้าง createdAt และ updatedAt อัตโนมัติ
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
RecordSchema.index(
  { createdAt: 1 }, // จับเวลาจาก field createdAt
  {
    expireAfterSeconds: 86400, // 86400 วินาที = 24 ชั่วโมง (1 วัน)
    partialFilterExpression: { payment: "unpaid" } // เงื่อนไขสำคัญ: ลบเฉพาะอันที่ payment เป็น "unpaid"
  }
);

module.exports = mongoose.model("Record", RecordSchema);