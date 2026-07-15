const express = require('express');
const router = express.Router();

// page route
router.get('/', (req, res) => {
    res.render('search', {
        title: 'Search Flights'
    });
});

// will add other functionality

module.exports = router;