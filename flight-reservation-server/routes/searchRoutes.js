const express = require('express');
const router = express.Router();

const searchController = require('../controllers/searchController');

router.get('/', searchController.showSearchPage);
router.post('/', searchController.showFlights);

module.exports = router;