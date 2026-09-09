require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const YAML = require("yamljs");

const app = express();
const PORT = process.env.PORT || 5000;
const db = require("./DB/connect.js");

const swaggerOption = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation (All)",
      version: "1.0.0",
      description: "เอกสาร API ทั้งหมด (รวม Admin และ Customer)",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./routers/**/*.js"], 
};
const swaggerSpec = swaggerJsdoc(swaggerOption);

let swaggerDocument = null;
try {
  swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
  
  // ถ้าไฟล์มีอยู่จริง แต่ว่างเปล่า (load ได้ null)
  if (!swaggerDocument) {
    console.warn("⚠️  [Swagger] 'swagger.yaml' file is empty or not found.");
    // สร้าง object เปล่าไว้กันพัง
    swaggerDocument = { paths: {}, components: {} }; 
  }
} catch (e) {
  console.error("❌  [Swagger] Error loading 'swagger.yaml':", e.message);
  // ถ้าไฟล์มีปัญหา syntax หรือหาไม่เจอ
  swaggerDocument = { paths: {}, components: {} }; 
}

const combinedSpec = {
  ...swaggerDocument, // 1. เอา YAML มาวางเป็นฐานก่อน
  ...swaggerSpec,     // 2. เอา JSDoc มาทับ (เพื่อให้ได้ Path ที่ generate มา)
  
  // 3. บังคับรวม Paths และ Components ให้ครบ
  paths: {
    ...swaggerDocument.paths, 
    ...swaggerSpec.paths,
  },
  components: {
    ...swaggerDocument.components,
    ...swaggerSpec.components,
  },
  
  // 4. สำคัญ! บังคับใช้ Info ของหน้านี้ (ไม่ให้ YAML มาทับชื่อ)
  info: swaggerSpec.info 
};
// console.log(JSON.stringify(combinedSpec, null, 2));
app.use("/api-docs", swaggerUi.serveFiles(combinedSpec), swaggerUi.setup(combinedSpec));


const swaggerOptionCustomer = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Customer API",
      version: "1.0.0",
      description: "API สำหรับลูกค้า",
    },
    servers: [{ url: "http://localhost:3000" }],
    // ดึงเฉพาะ Components มาใช้ (เพื่อไม่ให้ Path ของ Admin ใน YAML หลุดมา)
    components: swaggerDocument.components || {} 
  },
  apis: [
    "./routers/bookingRoutes.js",
    "./routers/checkStatus.js",
    "./routers/productRoutes.js",
    "./routers/contactRoutes.js",
    "./routers/drinkRoutes.js",
    "./routers/menuRoutes.js"
  ]
};

const swaggerSpecCustomer = swaggerJsdoc(swaggerOptionCustomer);

// ใช้ serveFiles แยก instance
app.use("/api-customer", swaggerUi.serveFiles(swaggerSpecCustomer), swaggerUi.setup(swaggerSpecCustomer));

const swaggerOptionAdmin = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admin API",
      version: "1.0.0",
      description: "API สำหรับแอดมิน",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: [
    "./routers/manageProduct/mpDrink.js",
    "./routers/manageProduct/mpMain.js",
    "./routers/manageProduct/mpMenu.js",
    "./routers/manageProduct/mpPackage.js",
    "./routers/contactUs/contactUs.js"
  ],
};

const swaggerSpecAdmin = swaggerJsdoc(swaggerOptionAdmin);

// --- สร้าง combinedSpecAdmin ตามที่คุณต้องการ ---
const combinedSpecAdmin = {
  ...swaggerSpecAdmin,        // เริ่มจาก JSDoc ของ Admin
  ...swaggerDocument,         // เอา YAML มาทับ (Info/Servers/Tags จาก YAML)
  paths: {
    ...swaggerDocument.paths, // เอา Path ใน YAML มาด้วย (ระวัง: ถ้าใน YAML มี path ลูกค้า มันจะติดมาด้วย)
    ...swaggerSpecAdmin.paths // เอา Path จาก JSDoc Admin มาทับ
  },
  components: {
    ...swaggerDocument.components, // เอา Components ใน YAML มา
    ...swaggerSpecAdmin.components // เอา Components จาก JSDoc Admin มาทับ
  },
  // ต้อง override info กลับเป็นของ Admin เพราะบรรทัด ...swaggerDocument อาจจะเอา title ของหน้าหลักมาทับ
  info: swaggerSpecAdmin.info 
};

// URL: /api-admin (ใช้ serveFiles และ combinedSpecAdmin)
app.use("/api-admin", swaggerUi.serveFiles(combinedSpecAdmin), swaggerUi.setup(combinedSpecAdmin));

// --- เพิ่มส่วนนี้: Import Passport และ Strategy ---
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// --- จบส่วนที่เพิ่ม ---

// Router ของคุณ (คงไว้เหมือนเดิม)
const OauthRouter = require("./routers/Oauth.js"); // (นี่คือไฟล์ที่แก้ไขในข้อ 1)

// Import models (คงไว้เหมือนเดิม)
const User = require("./model/usermodel");
const UserGoogle = require("./model/GoogleModel"); // Model นี้สำคัญสำหรับ Passport
const Record = require("./model/recordrecModel");
const Package = require("./model/packagemodel.js");
const Menu = require("./model/Menumodel");
const categoryPackage = require("./model/categoryPackage.js");
const categoryMenu = require("./model/categoryMenu.js");
const ContactMessage = require("./model/ContactMessageModel.js");

// Import routes (คงไว้เหมือนเดิม)
const menuRoutes = require("./routers/menuRoutes.js");
const productRoutes = require("./routers/productRoutes.js");
const drinkRoutes = require("./routers/drinkRoutes.js");
const bookingRoutes = require("./routers/bookingRoutes.js");
const userRoutes = require("./routers/userRoutes.js");
const contactRoutes = require("./routers/contactRoutes.js");

db();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// --- แก้ไข/ตั้งค่า Session ---
// (ย้ายมาจาก Oauth.js และแก้ไขเล็กน้อย)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // ใช้ SESSION_SECRET จาก .env
    resave: false,
    saveUninitialized: false, // แนะนำเป็น false
  })
);

// --- เพิ่มส่วนนี้: ตั้งค่า Passport (ย้ายมาจาก Oauth.js) ---
app.use(passport.initialize());
app.use(passport.session());

// --- เพิ่มส่วนนี้: ตั้งค่า Google Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. ค้นหาจาก Google ID ก่อน (แม่นยำที่สุด)
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2. ค้นหาจาก Email (เผื่อกรณีในอนาคตมีการเก็บ Email ของ User ทั่วไป)
        // แต่สำหรับเคสของคุณตอนนี้ ส่วนนี้อาจจะไม่เจอ user เก่า เพราะ User ทั่วไปไม่มี email
        // แต่ใส่ไว้กันเหนียว เผื่อในอนาคตคุณให้ User ทั่วไปกรอก Email ได้
        if (profile.emails && profile.emails.length > 0) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            // ถ้าเจอ Email ตรงกัน -> อัปเดต Google ID ใส่เข้าไป
            user.googleId = profile.id;
            user.provider = "google"; // หรือจะเก็บเป็น array ก็ได้ถ้าอยาก advanced
            await user.save();
            return done(null, user);
          }
        }

        // 3. ถ้าไม่เจอเลย -> สร้างใหม่
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value, // Google ส่ง email มาแน่ๆ
          displayName: profile.displayName,
          username: profile.displayName,
          role: "customer",
          provider: "google",
          // phone: ปล่อยว่างไว้ (เป็น null)
          // password: ปล่อยว่างไว้
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// --- เพิ่มส่วนนี้: ตั้งค่า Serialize/Deserialize (แนะนำให้แก้) ---
passport.serializeUser((user, done) => {
  done(null, user.id); // เก็บเฉพาะ ID ลง session
});

passport.deserializeUser(async (id, done) => {
  try {
    // ใช้ UserGoogle.findById เพื่อดึงข้อมูล User ใหม่จาก DB
    const user = await UserGoogle.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
// --- จบส่วนที่เพิ่ม ---

// --- เพิ่มส่วนนี้: Middleware ตรวจสอบการ Login ---
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
// --- จบส่วนที่เพิ่ม ---

// --- Routers ของคุณ (คงไว้เหมือนเดิม) ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", OauthRouter); // ตัวนี้จะไปเรียก Oauth.js (ที่แก้ไขแล้ว)

// ------- router จัดการออเดอร์ (คงไว้เหมือนเดิม) --------- //
app.use("/api", require("./routers/DataOrderNow"));
app.use("/api", require("./routers/DataOrderInYear"));
app.use("/api", require("./routers/DataOrderChage"));
app.use("/api", require("./routers/DataOrdering"));
app.use("/api", require("./routers/DataOrderChagedetail"));
app.use("/api", require("./routers/DataOrdercid"));
app.use("/api", require("./routers/DeleteOrderafterAcccept"));
app.use("/api", require("./routers/DeleteOrderAfterReject"));
app.use("/api", require("./routers/Team"));
app.use("/api", require("./routers/login"));
app.use("/api", require("./routers/Register"));
app.use("/api", require("./routers/DataOrderAllNoTeam"));
app.use("/api", require("./routers/paybackCancelOrder.js"));
app.use("/api", require("./routers/forgotpassword.js"));

// ------- router จัดการสินค้า (คงไว้เหมือนเดิม) --------- //
app.use("/api/mpmain", require("./routers/manageProduct/mpMain.js"));
app.use("/api/mpmenu", require("./routers/manageProduct/mpMenu.js"));
app.use("/api/mppackage", require("./routers/manageProduct/mpPackage.js"));
app.use("/api/mpdrink", require("./routers/manageProduct/mpDrink.js"));

// ------- router ติดต่อเราฝั่ง admin (คงไว้เหมือนเดิม) --------- //
app.use("/api/contact", require("./routers/contactUs/contactUs.js"));

// -------- customer router (คงไว้เหมือนเดิม) ---------- //
app.use("/api/menus", menuRoutes);
app.use("/api/products", productRoutes);
app.use("/api", drinkRoutes);
app.use("/api", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api", require("./routers/checkStatus.js"));
// --- จบส่วน Routers ของคุณ ---

// --- เพิ่มส่วนนี้: Routes ที่ย้ายมาจาก Oauth.js ---
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.send(`Hello, ${req.user.displayName}`);
});

app.get("/login", (req, res) => {
  res.send('กรุณา Login ด้วย Google <a href="/auth/google">Login</a>');
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});
// --- จบส่วนที่เพิ่ม ---

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
