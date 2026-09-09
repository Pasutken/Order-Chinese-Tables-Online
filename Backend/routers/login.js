const express = require("express");
const router = express.Router();
const User = require("../model/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Route for login page
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  console.log(phone,password)
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    console.log(user)

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
        phone: user.phone,
        username: user.username,
        lastname: user.lastname
      },
    };
    console.log(process.env.secretKey)
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    // { expiresIn: "1h" }

    res.status(200).json({ message: "Login page", token: token ,role: user.role});
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error)
  }
});

module.exports = router;
