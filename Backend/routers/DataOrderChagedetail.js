const router = require('express').Router();
const Record = require('../model/recordrecModel');



router.get('/DataOrderChagedetail', async (req, res) => {

    try {
        const ChangeProcessing = await Record.find({ 
            status: 'Order-Change-Processing' 
        });

        res.status(200).json({ 
            detail: ChangeProcessing,
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