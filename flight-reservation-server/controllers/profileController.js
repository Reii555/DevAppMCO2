const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Flight = require('../models/Flight');

// Render profile page
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        // Get user's reservations for the profile
        const reservations = await Reservation.find({ userId: req.user._id })
            .populate('flightId', 'flightId airline route departureDate departureTime arrivalDate arrivalTime status')
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('profile/profile', {
            title: 'My Profile',
            user: user,
            reservations: reservations,
            isAuthenticated: req.isAuthenticated,
            userRole: req.user.role
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).render('error', {
            message: 'Error loading profile',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Render edit profile page
exports.getEditProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        res.render('profile/edit-profile', {
            title: 'Edit Profile',
            user: user,
            isAuthenticated: req.isAuthenticated,
            userRole: req.user.role
        });
    } catch (error) {
        console.error('Edit profile error:', error);
        res.status(500).render('error', {
            message: 'Error loading edit profile',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Update profile 
exports.updateProfile = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            phone, 
            dateOfBirth, 
            passportNumber, 
            nationality, 
            gender 
            } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and phone are required'
            });
        }

        // Validate phone format
        const phoneRegex = /^\+63\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Valid phone format: +63 9XX XXX XXXX'
            });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                firstName,
                lastName,
                phone,
                dateOfBirth: dateOfBirth || undefined,
                passportNumber: passportNumber || undefined,
                nationality: nationality || undefined,
                gender: gender || undefined,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update session user data
        req.user = updatedUser;

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
};

// Update password 
exports.updatePassword = async (req, res) => {
    try {
        const { 
            currentPassword, 
            newPassword, 
            confirmPassword 
            } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

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
};

// Upload profile picture 
exports.uploadProfilePicture = async (req, res) => {
    try {
        // might update (?)
        const { 
            profilePicture 
            } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile picture updated',
            data: user
        });
    } catch (error) {
        console.error('Upload picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture'
        });
    }
};

// Get profile data 
exports.getProfileData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        // Get recent reservations
        const recentReservations = await Reservation.find({ userId: req.user._id })
            .populate('flightId', 'flightId airline route departureDate departureTime')
            .sort({ createdAt: -1 })
            .limit(3);

        // Get upcoming reservations (status: Pending or Confirmed)
        const upcomingReservations = await Reservation.find({
            userId: req.user._id,
            status: { $in: ['Pending', 'Confirmed'] }
        })
            .populate('flightId', 'flightId airline route departureDate departureTime')
            .sort({ 'flightId.departureDate': 1 })
            .limit(3);

        res.json({
            success: true,
            data: {
                user,
                recentReservations,
                upcomingReservations
            }
        });
    } catch (error) {
        console.error('Get profile data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile data'
        });
    }
};