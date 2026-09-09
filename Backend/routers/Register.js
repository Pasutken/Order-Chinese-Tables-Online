const express = require('express');
const router = express.Router();
const User = require('../model/usermodel');
const bcrypt = require('bcrypt');

// Route for Register page
router.post('/Register', async (req, res) => {
  try {
    const { username, lastname, password, phone } = req.body;
    console.log(username, lastname, password, phone)

    const user = new User({ username, lastname, password, phone });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: 'Register page' });
  } catch (error) {

    console.log(error)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Phone number already exists' });
    } 
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;
