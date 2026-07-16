const express = require('express');
const router = express.Router();
const User = require('../models/User');

// SHOW LOGIN PAGE
router.get('/login', (req, res) => {
    // If already logged in, redirect based on role
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin');
        }
        return res.redirect('/');
    }
    
    res.render('login', {
        title: 'Login',
        layout: false,
        error: null,
        success: null
    });
});

// PROCESS LOGIN - BOTH CUSTOMERS AND ADMINS
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.render('login', {
                title: 'Login',
                layout: false,
                error: 'Invalid email or password.',
                success: null,
                formData: req.body
            });
        }

        req.session.user = user;
        console.log('User logged in:', user.email);
        console.log('   Role:', user.role);

        if (user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/');
        }

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            title: 'Login',
            layout: false,
            error: 'Error logging in. Please try again.',
            success: null,
            formData: req.body
        });
    }
});

// LOGOUT ROUTE
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;