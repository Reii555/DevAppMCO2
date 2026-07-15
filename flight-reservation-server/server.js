const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const connectDB = require('./config/database');

// MODELS
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const Flight = require('./models/Flight');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// DATABASE CONNECTION
connectDB();

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// EXPRESS SESSION
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: false
}));

// Make user data available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.user ? true : false;
    next();
});

// ============================================================
// HANDLEBARS WITH HELPERS
// ============================================================
const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        // Format date helper
        formatDate: function(date) {
            if (!date) return 'N/A';
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        },
        // Format date for input fields
        formatDateInput: function(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        },
        // Equality helper
        eq: function(a, b) {
            return a === b;
        },
        // OR helper
        or: function(a, b) {
            return a || b;
        },
        // Format price
        formatPrice: function(price) {
            if (!price) return '₱0.00';
            return '₱' + parseFloat(price).toFixed(2);
        },
        // Check if value exists in array
        inArray: function(value, array) {
            if (!array) return false;
            return array.includes(value);
        }
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

<<<<<<< HEAD
console.log('📁 Views directory:', path.join(__dirname, 'views'));
console.log('📁 Public directory:', path.join(__dirname, 'public'));

// ============================================================
// ========== ALL ROUTES ==========
// ============================================================

// ---------- HOME PAGE ----------
=======
// ROUTES
const searchRoutes = require('./routes/searchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/search', searchRoutes);
app.use('/booking', bookingRoutes);

// Home Page
>>>>>>> 15cff4b209ae2a318acae0d39be77547521e1f12
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home',
        loggedIn: req.session.user ? true : false
    });
});

// ---------- LOGIN ROUTES ----------
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email,
            password: req.body.password
        });

        if (!user) {
            return res.send('Invalid email or password.');
        }

        req.session.user = user;
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.send('Error logging in. Please try again.');
    }
});

<<<<<<< HEAD
// ---------- SIGNUP ROUTES ----------
app.get('/signup', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
=======
// BOOKING ROUTES
app.get('/booking', (req, res) => {
    res.render('booking', { title: 'Book Flight' });
});

// MY RESERVATIONS ROUTES
app.get('/my-reservations', (req, res) => {
    res.render('my-reservations', { title: 'My Reservations' });
});

// DASHBOARD ROUTE
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
>>>>>>> 15cff4b209ae2a318acae0d39be77547521e1f12
    }
    res.render('signup', { title: 'Sign Up' });
});

app.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.send('Email already registered. Please login.');
        }

        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: 'customer'
        });

        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        res.send('Error creating account. Please try again.');
    }
});

// ============================================================
// ========== PROFILE ROUTES ==========
// ============================================================

// GET - Profile Page
app.get('/profile', (req, res) => {
    console.log('✅ Profile route hit!');
    
    // Auto-login for testing
    if (!req.session.user) {
        req.session.user = {
            _id: 'test123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            phone: '+639123456789',
            passportNumber: 'A12345678',
            nationality: 'Filipino',
            gender: 'Female',
            role: 'customer',
            createdAt: new Date()
        };
    }
    
    res.render('profile', { 
        title: 'My Profile',
        user: req.session.user,
        isAuthenticated: true
    });
});

// GET - Edit Profile Page
app.get('/profile/edit', (req, res) => {
    console.log('✅ Edit profile route hit!');
    
    if (!req.session.user) {
        req.session.user = {
            _id: 'test123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            phone: '+639123456789',
            passportNumber: 'A12345678',
            nationality: 'Filipino',
            gender: 'Female',
            role: 'customer'
        };
    }
    
    res.render('edit-profile', { 
        title: 'Edit Profile',
        user: req.session.user,
        isAuthenticated: true
    });
});

// ============================================================
// ========== RESERVATION ROUTES ==========
// ============================================================

// GET - My Reservations Page
app.get('/reservations', (req, res) => {
    console.log('✅ Reservations route hit!');
    
    if (!req.session.user) {
        req.session.user = {
            _id: 'test123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            role: 'customer'
        };
    }
    
    res.render('my-reservations', { 
        title: 'My Reservations',
        user: req.session.user,
        isAuthenticated: true
    });
});

// ============================================================
// ========== OTHER ROUTES ==========
// ============================================================

// GET - Search Flights Page
app.get('/search', (req, res) => {
    res.render('search', { 
        title: 'Search Flights',
        isAuthenticated: req.session.user ? true : false
    });
});

// GET - Booking Page
app.get('/booking', (req, res) => {
    if (!req.session.user) {
        req.session.user = {
            _id: 'test123',
            firstName: 'Test',
            lastName: 'User',
            role: 'customer'
        };
    }
    res.render('booking', { 
        title: 'Book Flight',
        user: req.session.user,
        isAuthenticated: true
    });
});

// ---------- ADMIN ROUTES ----------
app.get('/admin-reservations', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (req.session.user.role !== 'admin') {
        return res.send('Access Denied. Admin only.');
    }
    res.render('admin-reservations', { 
        title: 'Admin - Reservations',
        user: req.session.user,
        isAuthenticated: true
    });
});

app.get('/admin-users', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (req.session.user.role !== 'admin') {
        return res.send('Access Denied. Admin only.');
    }
    res.render('admin-users', { 
        title: 'Admin - Users',
        user: req.session.user,
        isAuthenticated: true
    });
});

// ---------- LOGOUT ----------
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// ============================================================
// ========== FALLBACK ROUTE (404) ==========
// ============================================================
app.get('*', (req, res) => {
    console.log('❌ 404 - Route not found:', req.url);
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Page Not Found</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #dc3545; }
                ul { list-style: none; padding: 0; }
                li { padding: 8px 0; border-bottom: 1px solid #eee; }
                a { color: #5686c9; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .highlight { background: #fff3cd; padding: 2px 8px; border-radius: 4px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <p><strong>Requested URL:</strong> <span class="highlight">${req.url}</span></p>
                <hr>
                <h3>📄 Available Routes:</h3>
                <ul>
                    <li><a href="/">/</a> - Home</li>
                    <li><a href="/login">/login</a> - Login</li>
                    <li><a href="/signup">/signup</a> - Signup</li>
                    <li><a href="/profile">/profile</a> - Profile</li>
                    <li><a href="/profile/edit">/profile/edit</a> - Edit Profile</li>
                    <li><a href="/reservations">/reservations</a> - My Reservations</li>
                    <li><a href="/search">/search</a> - Search Flights</li>
                    <li><a href="/booking">/booking</a> - Booking</li>
                    <li><a href="/admin-reservations">/admin-reservations</a> - Admin Reservations</li>
                    <li><a href="/admin-users">/admin-users</a> - Admin Users</li>
                    <li><a href="/logout">/logout</a> - Logout</li>
                </ul>
            </div>
        </body>
        </html>
    `);
});

// ============================================================
// ========== START SERVER ==========
// ============================================================

app.listen(PORT, () => {
<<<<<<< HEAD
    console.log('========================================');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('========================================');
    console.log('📁 Project Structure:');
    console.log(`   Views:   ${path.join(__dirname, 'views')}`);
    console.log(`   Public:  ${path.join(__dirname, 'public')}`);
    console.log('📄 Available Routes:');
    console.log('   - /                (Home)');
    console.log('   - /login           (Login)');
    console.log('   - /signup          (Signup)');
    console.log('   - /profile         (Profile)');
    console.log('   - /profile/edit    (Edit Profile)');
    console.log('   - /reservations    (My Reservations)');
    console.log('   - /search          (Search Flights)');
    console.log('   - /booking         (Booking)');
    console.log('   - /admin-reservations (Admin Reservations)');
    console.log('   - /admin-users     (Admin Users)');
    console.log('   - /logout          (Logout)');
    console.log('========================================');
});
=======
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// SAMPLE DATA 

(async () => {
    try {

        // Sample data for admin user (?) - replace values nalang
        const user = await User.create({
            firstName: "Test",
            lastName: "User",
            email: "test@test.com",
            password: "password123",
            phone: "+639123456789",
            dateOfBirth: new Date("2005-07-11"),
            passportNumber: "A12345678",
            nationality: "Filipino",
            gender: "Female",
            role: "customer",
            status: "active",
            lastLogin: new Date("2026-07-12"),
            profilePicture: "placeholder",
            emergencyContact: {
                name: "ParentTest",
                relationship: "Father",
                phone: "+639987654321",
                email: "parent@test.com"
            }
        });

        console.log("Sample User Created");

        // Sample data for flight collection
        const flight = await Flight.create({
            flight_number: "PR1001",
            airline: "Philippine Airlines",
            origin: "Manila (MNL)",
            destination: "Cebu (CEB)",
            departureTime: new Date("2026-07-14T08:00:00"),
            arrivalTime: new Date("2026-07-14T09:30:00"),
            basePrice: 4000,
            cabinClass: "Economy",
            availableSeats: 40,
            status: "Upcoming"
        });

        console.log("Sample Flight Created");

        // Sample data for seats collection
        const seats = [];

        for (let row = 1; row <= 10; row++) {
            const letters = ["A", "B", "C", "D"];

            for (const letter of letters) {
                seats.push({
                    flight_id: flight._id,
                    seatNumber: `${row}${letter}`,
                    status: "Unoccupied"
                });
            }
        }

        seats[1].status = "Occupied";   // occupied = 1B (for testing purposes)

        await Seat.insertMany(seats);

        console.log("Sample Seats created.");

    } catch (err) {
        console.log(err);
    }
})();
>>>>>>> 15cff4b209ae2a318acae0d39be77547521e1f12
