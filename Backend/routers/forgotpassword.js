const router = require('express').Router();
const User = require('../model/usermodel');
const bcrypt = require('bcrypt');

router.post('/ForgotPassword', async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Verify' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/ResetPassword', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;  

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;