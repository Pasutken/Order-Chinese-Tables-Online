const exxpress = require('express');
const router = exxpress.Router();
const Record = require('../model/recordrecModel');

router.get('/DataOrdering', async (req, res) => {
    try {
        const Ordering = await Record.find({ 
            status: 'in-progress'
        });
        res.status(200).json({ 
            Ordering: Ordering,
            message: 'Success' 
        });
     
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;