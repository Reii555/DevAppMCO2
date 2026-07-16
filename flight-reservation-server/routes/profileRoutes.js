const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reservation = require('../models/Reservation');

// ============================================================
// PAGE ROUTES
// ============================================================

// GET - Profile Page
router.get('/', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Get updated user data from database
        const user = await User.findById(req.session.user._id);
        if (!user) {
            req.session.destroy();
            return res.redirect('/login');
        }

        // Get user's recent reservations
        const reservations = await Reservation.find({ userId: req.session.user._id })
            .populate('flightId')
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('profile', {
            title: 'My Profile',
            user: user,
            reservations: reservations,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Profile error:', error);
        // If error, still render profile with available data
        res.render('profile', {
            title: 'My Profile',
            user: req.session.user,
            reservations: [],
            isAuthenticated: true
        });
    }
});

// GET - Edit Profile Page
router.get('/edit', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const user = await User.findById(req.session.user._id);
        if (!user) {
            req.session.destroy();
            return res.redirect('/login');
        }

        res.render('edit-profile', {
            title: 'Edit Profile',
            user: user,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Edit profile error:', error);
        // If error, still render edit profile with available data
        res.render('edit-profile', {
            title: 'Edit Profile',
            user: req.session.user,
            isAuthenticated: true
        });
    }
});

// ============================================================
// AJAX FUNCTIONALITY
// ============================================================

// PUT - Update Profile (AJAX)
router.put('/', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { firstName, lastName, phone, dateOfBirth, passportNumber, nationality, gender } = req.body;

        // Validation
        if (!firstName || !lastName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and phone are required'
            });
        }

        // Validate phone format (international)
        const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number (e.g., +63 912 345 6789)'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.user._id,
            {
                firstName,
                lastName,
                phone,
                dateOfBirth: dateOfBirth || undefined,
                passportNumber: passportNumber || undefined,
                nationality: nationality || undefined,
                gender: gender || undefined
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update session
        req.session.user = updatedUser;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating profile'
        });
    }
});

// PUT - Update Password (AJAX)
router.put('/password', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Get user with password
        const user = await User.findById(req.session.user._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password (simple comparison since no bcrypt)
        if (user.password !== currentPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        // Update session
        req.session.user = user;

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating password'
        });
    }
});

// POST - Upload Profile Picture (AJAX)
router.post('/picture', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { profilePicture } = req.body;

        if (!profilePicture) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.user._id,
            { profilePicture },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        req.session.user = updatedUser;

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Upload picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture'
        });
    }
});

// GET - Profile Data (AJAX)
router.get('/data', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const user = await User.findById(req.session.user._id);
        
        const recentReservations = await Reservation.find({ userId: user._id })
            .populate('flightId')
            .sort({ createdAt: -1 })
            .limit(3);

        res.json({
            success: true,
            data: {
                user,
                recentReservations
            }
        });
    } catch (error) {
        console.error('Get profile data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile data'
        });
    }
});

module.exports = router;