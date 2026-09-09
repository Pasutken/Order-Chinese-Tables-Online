const express = require('express'); // Fixed typo: exxpress -> express
const router = express.Router();
const Record = require('../model/recordrecModel');

router.get('/Dashboard_DataOrderChage', async (req, res) => {
    try {
        const ChangeProcessing = await Record.countDocuments({ 
            status: 'Order-Change-Processing' 
        });
        
        res.status(200).json({ 
            orderChage: ChangeProcessing,
            message: 'Success' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
});

module.exports = router;