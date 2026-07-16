const User = require('../models/User');
const Reservation = require('../models/Reservation');

// ============================================================
// PAGE ROUTES
// ============================================================

exports.showProfilePage = async (req, res) => {
    try {
        // Get the user from the database directly (for testing purposes)
        let userId = null;
        
        // First try to get userId from session
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        }
        
        // If no session userId, find the first user
        if (!userId) {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }
        
        // If still no user, create one
        if (!userId) {
            const newUser = new User({
                firstName: 'Reina',
                lastName: 'Lagos',
                email: 'reina.lagos@hotmail.com',
                password: 'password123',
                phone: '+639988776655',
                dateOfBirth: new Date('1992-03-15'),
                passportNumber: 'A12345678',
                nationality: 'Filipino',
                gender: 'Female',
                role: 'customer',
                status: 'active'
            });
            await newUser.save();
            userId = newUser._id;
            if (req.session) {
                req.session.user = newUser;
            }
        }
        
        // Get the user data from database
        const user = await User.findById(userId);
        
        if (!user) {
            // If user not found, create one
            const newUser = new User({
                firstName: 'Reina',
                lastName: 'Lagos',
                email: 'reina.lagos@hotmail.com',
                password: 'password123',
                phone: '+639988776655',
                dateOfBirth: new Date('1992-03-15'),
                passportNumber: 'A12345678',
                nationality: 'Filipino',
                gender: 'Female',
                role: 'customer',
                status: 'active'
            });
            await newUser.save();
            if (req.session) {
                req.session.user = newUser;
            }
            // Update the user variable with the new user
            const updatedUser = await User.findById(newUser._id);
            return res.render('profile', {
                title: 'My Profile',
                user: updatedUser,
                reservations: [],
                isAuthenticated: true
            });
        }

        // Update the session with the latest user data
        if (req.session) {
            req.session.user = user;
        }

        // Get user's reservations
        let reservations = [];
        try {
            reservations = await Reservation.find({ userId: user._id })
                .populate('flightId')
                .sort({ createdAt: -1 })
                .limit(5);
        } catch (err) {
            console.log('No reservations found');
        }

        res.render('profile', {
            title: 'My Profile',
            user: user,
            reservations: reservations,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Profile error:', error);
        // Try to find any user as fallback
        try {
            const anyUser = await User.findOne({});
            if (anyUser) {
                if (req.session) {
                    req.session.user = anyUser;
                }
                return res.render('profile', {
                    title: 'My Profile',
                    user: anyUser,
                    reservations: [],
                    isAuthenticated: true
                });
            }
        } catch (e) {
            console.error('Fallback error:', e);
        }
        res.render('profile', {
            title: 'My Profile',
            user: { firstName: 'Guest', lastName: 'User', profilePicture: null },
            reservations: [],
            isAuthenticated: false
        });
    }
};

exports.showEditProfilePage = async (req, res) => {
    try {
        let userId = null;
        
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        }
        
        if (!userId) {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }
        
        if (!userId) {
            const newUser = new User({
                firstName: 'Reina',
                lastName: 'Lagos',
                email: 'reina.lagos@hotmail.com',
                password: 'password123',
                phone: '+639988776655',
                dateOfBirth: new Date('1992-03-15'),
                passportNumber: 'A12345678',
                nationality: 'Filipino',
                gender: 'Female',
                role: 'customer',
                status: 'active'
            });
            await newUser.save();
            userId = newUser._id;
            if (req.session) {
                req.session.user = newUser;
            }
        }
        
        // Get the user data from database
        const user = await User.findById(userId);
        
        if (!user) {
            const newUser = new User({
                firstName: 'Reina',
                lastName: 'Lagos',
                email: 'reina.lagos@hotmail.com',
                password: 'password123',
                phone: '+639988776655',
                dateOfBirth: new Date('1992-03-15'),
                passportNumber: 'A12345678',
                nationality: 'Filipino',
                gender: 'Female',
                role: 'customer',
                status: 'active'
            });
            await newUser.save();
            if (req.session) {
                req.session.user = newUser;
            }
            const updatedUser = await User.findById(newUser._id);
            return res.render('edit-profile', {
                title: 'Edit Profile',
                user: updatedUser,
                isAuthenticated: true
            });
        }

        if (req.session) {
            req.session.user = user;
        }

        res.render('edit-profile', {
            title: 'Edit Profile',
            user: user,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Edit profile error:', error);
        try {
            const anyUser = await User.findOne({});
            if (anyUser) {
                if (req.session) {
                    req.session.user = anyUser;
                }
                return res.render('edit-profile', {
                    title: 'Edit Profile',
                    user: anyUser,
                    isAuthenticated: true
                });
            }
        } catch (e) {
            console.error('Fallback error:', e);
        }
        res.render('edit-profile', {
            title: 'Edit Profile',
            user: req.session.user || { firstName: 'Guest', lastName: 'User' },
            isAuthenticated: false
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        console.log('Update profile called with body:', req.body);
        
        const { firstName, lastName, phone, dateOfBirth, passportNumber, nationality, gender } = req.body;

        if (!firstName || !lastName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and phone are required'
            });
        }

        const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number (e.g., +63 912 345 6789)'
            });
        }

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateData = {
            firstName: firstName,
            lastName: lastName,
            phone: phone
        };

        if (dateOfBirth) {
            updateData.dateOfBirth = new Date(dateOfBirth);
        }
        if (passportNumber) {
            updateData.passportNumber = passportNumber.toUpperCase();
        }
        if (nationality) {
            updateData.nationality = nationality;
        }
        if (gender) {
            updateData.gender = gender;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update the session with the latest user data
        if (req.session) {
            req.session.user = updatedUser;
        }

        console.log('User updated successfully, returning:', updatedUser.firstName, updatedUser.lastName);

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

exports.uploadProfilePicture = async (req, res) => {
    try {
        const { profilePicture } = req.body;

        if (!profilePicture) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: profilePicture },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.session) {
            req.session.user = updatedUser;
        }

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
};

exports.getProfileData = async (req, res) => {
    try {
        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        
        const recentReservations = await Reservation.find({ userId: user._id })
            .populate('flightId')
            .sort({ createdAt: -1 })
            .limit(3);

        res.json({
            success: true,
            data: {
                user: user,
                recentReservations: recentReservations
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

exports.getSavedPassengers = async (req, res) => {
    try {
        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        res.json({
            success: true,
            data: user.savedPassengers || []
        });
    } catch (error) {
        console.error('Get saved passengers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved passengers'
        });
    }
};

exports.addSavedPassenger = async (req, res) => {
    try {
        const { firstName, lastName, passportNumber, dateOfBirth, nationality, gender, type } = req.body;

        if (!firstName || !lastName || !passportNumber || !dateOfBirth || !nationality || !gender) {
            return res.status(400).json({
                success: false,
                message: 'All passenger fields are required'
            });
        }

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        user.savedPassengers.push({
            firstName: firstName,
            lastName: lastName,
            passportNumber: passportNumber,
            dateOfBirth: new Date(dateOfBirth),
            nationality: nationality,
            gender: gender,
            type: type || 'Adult'
        });

        await user.save();
        
        if (req.session) {
            req.session.user = user;
        }

        res.json({
            success: true,
            message: 'Passenger saved successfully',
            data: user.savedPassengers
        });
    } catch (error) {
        console.error('Add saved passenger error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error saving passenger'
        });
    }
};

exports.removeSavedPassenger = async (req, res) => {
    try {
        const passengerIndex = req.params.index;

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        if (passengerIndex >= 0 && passengerIndex < user.savedPassengers.length) {
            user.savedPassengers.splice(passengerIndex, 1);
            await user.save();
            
            if (req.session) {
                req.session.user = user;
            }

            res.json({
                success: true,
                message: 'Passenger removed successfully',
                data: user.savedPassengers
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Passenger not found'
            });
        }
    } catch (error) {
        console.error('Remove saved passenger error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing passenger'
        });
    }
};

exports.getPaymentMethods = async (req, res) => {
    try {
        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        res.json({
            success: true,
            data: user.paymentMethods || []
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment methods'
        });
    }
};

exports.addPaymentMethod = async (req, res) => {
    try {
        const { cardType, cardNumber, cardholderName, expiryMonth, expiryYear, isDefault } = req.body;

        if (!cardType || !cardNumber || !cardholderName || !expiryMonth || !expiryYear) {
            return res.status(400).json({
                success: false,
                message: 'All payment fields are required'
            });
        }

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);

        if (isDefault) {
            user.paymentMethods.forEach(function(card) {
                card.isDefault = false;
            });
        }

        user.paymentMethods.push({
            cardType: cardType,
            cardNumber: cardNumber,
            cardholderName: cardholderName,
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            isDefault: isDefault || false
        });

        await user.save();
        
        if (req.session) {
            req.session.user = user;
        }

        res.json({
            success: true,
            message: 'Payment method added successfully',
            data: user.paymentMethods
        });
    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding payment method'
        });
    }
};

exports.removePaymentMethod = async (req, res) => {
    try {
        const cardIndex = req.params.index;

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        if (cardIndex >= 0 && cardIndex < user.paymentMethods.length) {
            const removedCard = user.paymentMethods[cardIndex];
            user.paymentMethods.splice(cardIndex, 1);

            if (removedCard.isDefault && user.paymentMethods.length > 0) {
                user.paymentMethods[0].isDefault = true;
            }

            await user.save();
            
            if (req.session) {
                req.session.user = user;
            }

            res.json({
                success: true,
                message: 'Payment method removed successfully',
                data: user.paymentMethods
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }
    } catch (error) {
        console.error('Remove payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing payment method'
        });
    }
};

exports.setDefaultPaymentMethod = async (req, res) => {
    try {
        const cardIndex = req.params.index;

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        if (cardIndex >= 0 && cardIndex < user.paymentMethods.length) {
            user.paymentMethods.forEach(function(card, index) {
                card.isDefault = (index === parseInt(cardIndex));
            });

            await user.save();
            
            if (req.session) {
                req.session.user = user;
            }

            res.json({
                success: true,
                message: 'Default payment method updated',
                data: user.paymentMethods
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }
    } catch (error) {
        console.error('Set default payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating default payment method'
        });
    }
};

exports.updateNotificationPreferences = async (req, res) => {
    try {
        const { promotionalOffers, flightStatusAlerts, loyaltyUpdates, smsAlerts } = req.body;

        let userId = null;
        if (req.session && req.session.user && req.session.user._id) {
            userId = req.session.user._id;
        } else {
            const user = await User.findOne({});
            if (user) {
                userId = user._id;
            }
        }

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(userId);
        
        let promoValue = promotionalOffers;
        if (promoValue === undefined) {
            promoValue = user.notificationPreferences.promotionalOffers;
        }
        
        let flightValue = flightStatusAlerts;
        if (flightValue === undefined) {
            flightValue = user.notificationPreferences.flightStatusAlerts;
        }
        
        let loyaltyValue = loyaltyUpdates;
        if (loyaltyValue === undefined) {
            loyaltyValue = user.notificationPreferences.loyaltyUpdates;
        }
        
        let smsValue = smsAlerts;
        if (smsValue === undefined) {
            smsValue = user.notificationPreferences.smsAlerts;
        }

        user.notificationPreferences = {
            promotionalOffers: promoValue,
            flightStatusAlerts: flightValue,
            loyaltyUpdates: loyaltyValue,
            smsAlerts: smsValue
        };

        await user.save();
        
        if (req.session) {
            req.session.user = user;
        }

        res.json({
            success: true,
            message: 'Notification preferences updated',
            data: user.notificationPreferences
        });
    } catch (error) {
        console.error('Update notification preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification preferences'
        });
    }
};