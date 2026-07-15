const express = require('express');
const router = express.Router();

const User = require("../models/User");

// GET Admin users page
router.get('/users', async (req, res) => {
    try {
        res.render('admin-users', {
            title: 'Users',
            layout: 'main-admin',
            user: req.session.user || { firstName: 'Test', lastName: 'Admin' },
            activePage: 'users'
        });
    } catch (error) {
        console.error('Error loading admin-users:', error);
        res.status(500).send('Error loading users: ' + error.message);
    }
});

module.exports = router;