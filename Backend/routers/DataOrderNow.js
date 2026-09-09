const exxpress = require('express');
const router = exxpress.Router();
const Record = require('../model/recordrecModel');

router.get('/Dashboard_DataOrderNow', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ordersToday = await Record.countDocuments({
            createdAt: { $gte: today }
        });
        res.status(200).json({ 
            orderNow: ordersToday,
            message: 'Success' 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;