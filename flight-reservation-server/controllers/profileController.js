const User = require('../models/User');
const Passenger = require('../models/Passenger');
const Reservation = require('../models/Reservation');

// ============================================================
// PAGE ROUTES
// ============================================================

exports.showProfilePage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        let passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            const newPassenger = new Passenger({
                user_id: req.session.user._id,
                full_name: req.session.user.full_name || 'User',
                contact_num: req.session.user.phone || 'N/A',
                passport_num: 'PENDING' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                nationality: 'Filipino',
                birth_date: new Date('2000-01-01'),
                gender: 'Prefer not to say',
                emergency_contact: 'N/A',
                savedPassengers: [],
                paymentMethods: [],
                notificationPreferences: {
                    promotionalOffers: true,
                    flightStatusAlerts: true,
                    loyaltyUpdates: true,
                    smsAlerts: true
                }
            });
            await newPassenger.save();
            passenger = newPassenger;
        }

        if (!passenger.savedPassengers) {
            passenger.savedPassengers = [];
        }
        if (!passenger.paymentMethods) {
            passenger.paymentMethods = [];
        }
        if (!passenger.notificationPreferences) {
            passenger.notificationPreferences = {
                promotionalOffers: true,
                flightStatusAlerts: true,
                loyaltyUpdates: true,
                smsAlerts: true
            };
        }

        let reservations = [];
        try {
            reservations = await Reservation.find({ userId: req.session.user._id })
                .populate('flightId')
                .sort({ createdAt: -1 })
                .limit(5);
        } catch (err) {
            console.log('No reservations found');
        }

        const userData = {
            _id: req.session.user._id,
            email: req.session.user.email,
            phone: req.session.user.phone,
            role: req.session.user.role,
            full_name: passenger.full_name || '',
            contact_num: passenger.contact_num || '',
            passport_num: passenger.passport_num || '',
            nationality: passenger.nationality || 'Filipino',
            birth_date: passenger.birth_date || new Date('2000-01-01'),
            gender: passenger.gender || 'Prefer not to say',
            type: passenger.type || 'Adult',
            emergency_contact: passenger.emergency_contact || '',
            profilePicture: passenger.profilePicture || null,
            savedPassengers: passenger.savedPassengers || [],
            paymentMethods: passenger.paymentMethods || [],
            notificationPreferences: passenger.notificationPreferences || {
                promotionalOffers: true,
                flightStatusAlerts: true,
                loyaltyUpdates: true,
                smsAlerts: true
            },
            createdAt: passenger.createdAt || new Date()
        };

        res.render('profile', {
            title: 'My Profile',
            user: userData,
            reservations: reservations,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.render('profile', {
            title: 'My Profile',
            user: req.session.user || { email: 'Guest' },
            reservations: [],
            isAuthenticated: false
        });
    }
};

exports.showEditProfilePage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        let passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            const newPassenger = new Passenger({
                user_id: req.session.user._id,
                full_name: req.session.user.full_name || 'User',
                contact_num: req.session.user.phone || 'N/A',
                passport_num: 'PENDING' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                nationality: 'Filipino',
                birth_date: new Date('2000-01-01'),
                gender: 'Prefer not to say',
                emergency_contact: 'N/A'
            });
            await newPassenger.save();
            passenger = newPassenger;
        }

        const userData = {
            _id: req.session.user._id,
            email: req.session.user.email,
            phone: req.session.user.phone,
            role: req.session.user.role,
            full_name: passenger.full_name || '',
            contact_num: passenger.contact_num || '',
            passport_num: passenger.passport_num || '',
            nationality: passenger.nationality || 'Filipino',
            birth_date: passenger.birth_date || new Date('2000-01-01'),
            gender: passenger.gender || 'Prefer not to say',
            type: passenger.type || 'Adult',
            emergency_contact: passenger.emergency_contact || '',
            profilePicture: passenger.profilePicture || null
        };

        res.render('edit-profile', {
            title: 'Edit Profile',
            user: userData,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Edit profile error:', error);
        res.render('edit-profile', {
            title: 'Edit Profile',
            user: req.session.user || { email: 'Guest' },
            isAuthenticated: false
        });
    }
};

// ============================================================
// HELPER FUNCTION - Check for duplicate passport
// ============================================================

async function isPassportDuplicate(passportNumber, excludeUserId) {
    const passport = passportNumber.toUpperCase().trim();
    
    // Check if any passenger has this passport number (excluding the current user)
    const existingPassenger = await Passenger.findOne({
        passport_num: passport,
        user_id: { $ne: excludeUserId }
    });
    
    if (existingPassenger) {
        return true;
    }
    
    // Check if any saved passenger has this passport number
    const allPassengers = await Passenger.find({
        user_id: { $ne: excludeUserId }
    });
    
    for (let p of allPassengers) {
        if (p.savedPassengers && p.savedPassengers.length > 0) {
            const found = p.savedPassengers.some(function(sp) {
                return sp.passportNumber && sp.passportNumber.toUpperCase() === passport;
            });
            if (found) {
                return true;
            }
        }
    }
    
    return false;
}

// ============================================================
// Profile using AJAX
// ============================================================

exports.updateProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { full_name, contact_num, passport_num, nationality, birth_date, gender, type, emergency_contact } = req.body;

        if (!full_name || !contact_num || !passport_num || !nationality || !birth_date || !gender) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(contact_num)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number (e.g., +63 912 345 6789)'
            });
        }

        const formattedPassport = passport_num.toUpperCase().trim();
        if (!/^[A-Z0-9]{6,10}$/.test(formattedPassport)) {
            return res.status(400).json({
                success: false,
                message: 'Passport number must be 6-10 alphanumeric characters'
            });
        }

        // Check for duplicate passport number (excluding current user)
        const isDuplicate = await isPassportDuplicate(formattedPassport, req.session.user._id);
        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                message: 'This passport number is already registered to another passenger'
            });
        }

        // Update User phone
        await User.findByIdAndUpdate(
            req.session.user._id,
            { phone: contact_num },
            { new: true }
        );

        // Update Passenger
        const updateData = {
            full_name: full_name,
            contact_num: contact_num,
            passport_num: formattedPassport,
            nationality: nationality || 'Filipino',
            birth_date: new Date(birth_date),
            gender: gender || 'Prefer not to say',
            type: type || 'Adult',
            emergency_contact: emergency_contact || 'N/A'
        };

        const updatedPassenger = await Passenger.findOneAndUpdate(
            { user_id: req.session.user._id },
            updateData,
            { new: true, runValidators: true, upsert: true }
        );

        if (!updatedPassenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedPassenger
        });
    } catch (error) {
        console.error('Update profile error:', error);
        // Check if it's a duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This passport number is already registered to another passenger'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating profile'
        });
    }
};

exports.uploadProfilePicture = async (req, res) => {
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

        let passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            passenger = new Passenger({
                user_id: req.session.user._id,
                full_name: req.session.user.full_name || 'User',
                contact_num: req.session.user.phone || 'N/A',
                passport_num: 'PENDING' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                nationality: 'Filipino',
                birth_date: new Date('2000-01-01'),
                gender: 'Prefer not to say',
                emergency_contact: 'N/A',
                profilePicture: profilePicture
            });
            await passenger.save();
        } else {
            passenger.profilePicture = profilePicture;
            await passenger.save();
        }

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            data: passenger
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
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger profile not found'
            });
        }

        const recentReservations = await Reservation.find({ userId: req.session.user._id })
            .populate('flightId')
            .sort({ createdAt: -1 })
            .limit(3);

        const userData = {
            _id: req.session.user._id,
            email: req.session.user.email,
            phone: req.session.user.phone,
            full_name: passenger.full_name || '',
            contact_num: passenger.contact_num || '',
            passport_num: passenger.passport_num || '',
            nationality: passenger.nationality || 'Filipino',
            birth_date: passenger.birth_date || new Date('2000-01-01'),
            gender: passenger.gender || 'Prefer not to say',
            type: passenger.type || 'Adult',
            emergency_contact: passenger.emergency_contact || '',
            profilePicture: passenger.profilePicture || null,
            savedPassengers: passenger.savedPassengers || [],
            paymentMethods: passenger.paymentMethods || []
        };

        res.json({
            success: true,
            data: {
                user: userData,
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

// ============================================================
// Saved Passengers using AJAX
// ============================================================

exports.getSavedPassengers = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger profile not found'
            });
        }

        res.json({
            success: true,
            data: passenger.savedPassengers || []
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
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { firstName, lastName, passportNumber, dateOfBirth, nationality, gender, type } = req.body;

        if (!firstName || !lastName || !passportNumber || !dateOfBirth || !nationality || !gender) {
            return res.status(400).json({
                success: false,
                message: 'All passenger fields are required'
            });
        }

        const formattedPassport = passportNumber.toUpperCase().trim();
        if (!/^[A-Z0-9]{6,10}$/.test(formattedPassport)) {
            return res.status(400).json({
                success: false,
                message: 'Passport number must be 6-10 alphanumeric characters'
            });
        }

        // Check for duplicate passport number
        const isDuplicate = await isPassportDuplicate(formattedPassport, req.session.user._id);
        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                message: 'This passport number is already registered to another passenger'
            });
        }

        let passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            passenger = new Passenger({
                user_id: req.session.user._id,
                full_name: req.session.user.full_name || 'User',
                contact_num: req.session.user.phone || 'N/A',
                passport_num: 'PENDING' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                nationality: 'Filipino',
                birth_date: new Date('2000-01-01'),
                gender: 'Prefer not to say',
                emergency_contact: 'N/A',
                savedPassengers: []
            });
            await passenger.save();
        }

        if (!passenger.savedPassengers) {
            passenger.savedPassengers = [];
        }

        // Also check within the user's own saved passengers
        const ownDuplicate = passenger.savedPassengers.some(function(sp) {
            return sp.passportNumber && sp.passportNumber.toUpperCase() === formattedPassport;
        });

        if (ownDuplicate) {
            return res.status(400).json({
                success: false,
                message: 'This passport number is already in your saved passengers list'
            });
        }

        passenger.savedPassengers.push({
            firstName: firstName,
            lastName: lastName,
            passportNumber: formattedPassport,
            dateOfBirth: new Date(dateOfBirth),
            nationality: nationality,
            gender: gender,
            type: type || 'Adult'
        });

        await passenger.save();

        res.json({
            success: true,
            message: 'Passenger saved successfully',
            data: passenger.savedPassengers
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
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const passengerIndex = req.params.index;

        const passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger profile not found'
            });
        }

        if (!passenger.savedPassengers || passengerIndex >= passenger.savedPassengers.length) {
            return res.status(404).json({
                success: false,
                message: 'Passenger not found'
            });
        }

        passenger.savedPassengers.splice(passengerIndex, 1);
        await passenger.save();

        res.json({
            success: true,
            message: 'Passenger removed successfully',
            data: passenger.savedPassengers
        });
    } catch (error) {
        console.error('Remove saved passenger error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing passenger'
        });
    }
};

// ============================================================
// Payment Methods using AJAX
// ============================================================

exports.getPaymentMethods = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger profile not found'
            });
        }

        res.json({
            success: true,
            data: passenger.paymentMethods || []
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
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { cardType, cardNumber, cardholderName, expiryMonth, expiryYear, isDefault } = req.body;

        if (!cardType || !cardNumber || !cardholderName || !expiryMonth || !expiryYear) {
            return res.status(400).json({
                success: false,
                message: 'All payment fields are required'
            });
        }

        let passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            passenger = new Passenger({
                user_id: req.session.user._id,
                full_name: req.session.user.full_name || 'User',
                contact_num: req.session.user.phone || 'N/A',
                passport_num: 'PENDING' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                nationality: 'Filipino',
                birth_date: new Date('2000-01-01'),
                gender: 'Prefer not to say',
                emergency_contact: 'N/A',
                paymentMethods: []
            });
            await passenger.save();
        }

        if (!passenger.paymentMethods) {
            passenger.paymentMethods = [];
        }

        if (isDefault) {
            passenger.paymentMethods.forEach(function(card) {
                card.isDefault = false;
            });
        }

        passenger.paymentMethods.push({
            cardType: cardType,
            cardNumber: cardNumber,
            cardholderName: cardholderName,
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            isDefault: isDefault || false
        });

        await passenger.save();

        res.json({
            success: true,
            message: 'Payment method added successfully',
            data: passenger.paymentMethods
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
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const cardIndex = req.params.index;

        const passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger profile not found'
            });
        }

        if (!passenger.paymentMethods || cardIndex >= passenger.paymentMethods.length) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        const removedCard = passenger.paymentMethods[cardIndex];
        passenger.paymentMethods.splice(cardIndex, 1);

        if (removedCard.isDefault && passenger.paymentMethods.length > 0) {
            passenger.paymentMethods[0].isDefault = true;
        }

        await passenger.save();

        res.json({
            success: true,
            message: 'Payment method removed successfully',
            data: passenger.paymentMethods
        });
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
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const cardIndex = req.params.index;

        const passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger profile not found'
            });
        }

        if (!passenger.paymentMethods || cardIndex >= passenger.paymentMethods.length) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        passenger.paymentMethods.forEach(function(card, index) {
            card.isDefault = (index === parseInt(cardIndex));
        });

        await passenger.save();

        res.json({
            success: true,
            message: 'Default payment method updated',
            data: passenger.paymentMethods
        });
    } catch (error) {
        console.error('Set default payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating default payment method'
        });
    }
};

// ============================================================
// Notification Preferences using AJAX
// ============================================================

exports.updateNotificationPreferences = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { promotionalOffers, flightStatusAlerts, loyaltyUpdates, smsAlerts } = req.body;

        let passenger = await Passenger.findOne({ user_id: req.session.user._id });
        
        if (!passenger) {
            passenger = new Passenger({
                user_id: req.session.user._id,
                full_name: req.session.user.full_name || 'User',
                contact_num: req.session.user.phone || 'N/A',
                passport_num: 'PENDING' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                nationality: 'Filipino',
                birth_date: new Date('2000-01-01'),
                gender: 'Prefer not to say',
                emergency_contact: 'N/A'
            });
            await passenger.save();
        }

        if (!passenger.notificationPreferences) {
            passenger.notificationPreferences = {
                promotionalOffers: true,
                flightStatusAlerts: true,
                loyaltyUpdates: true,
                smsAlerts: true
            };
        }

        if (promotionalOffers !== undefined) {
            passenger.notificationPreferences.promotionalOffers = promotionalOffers;
        }
        if (flightStatusAlerts !== undefined) {
            passenger.notificationPreferences.flightStatusAlerts = flightStatusAlerts;
        }
        if (loyaltyUpdates !== undefined) {
            passenger.notificationPreferences.loyaltyUpdates = loyaltyUpdates;
        }
        if (smsAlerts !== undefined) {
            passenger.notificationPreferences.smsAlerts = smsAlerts;
        }

        await passenger.save();

        res.json({
            success: true,
            message: 'Notification preferences updated',
            data: passenger.notificationPreferences
        });
    } catch (error) {
        console.error('Update notification preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification preferences'
        });
    }
};