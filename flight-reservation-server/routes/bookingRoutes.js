const express = require('express');
const router = express.Router();

// page route
router.get('/', (req, res) => {
    res.render('booking', {
        title: 'Book Flight'
    });
});

// will add other functionality

module.exports = router;