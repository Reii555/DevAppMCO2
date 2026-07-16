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
        layout: 'main',
        error: null,
        success: null
    });
});

// PROCESS LOGIN - BOTH CUSTOMERS AND ADMINS
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email and password
        const user = await User.findOne({ email, password });

        // 2. If no user found, show error
        if (!user) {
            return res.render('login', {
                title: 'Login',
                layout: 'main',
                error: 'Invalid email or password.',
                success: null,
                formData: req.body
            });
        }

        // 3. Save user to session (loggin them in)
        req.session.user = user;
        console.log('User logged in:', user.email);
        console.log('   Role:', user.role);

        // 4. Redirect based on role
        if (user.role === 'admin') {
            // Admin goes to admin panel
            return res.redirect('/admin-dashboard');
        } else {
            // Customer goes to ??
            return res.redirect('/index');
        }

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            title: 'Login',
            layout: 'main',
            error: 'Error logging in. Please try again.',
            success: null,
            formData: req.body
        });
    }
});

module.exports = router;