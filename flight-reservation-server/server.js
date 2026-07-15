const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const connectDB = require('./config/database');

// MODELS
const User = require('./models/User');
const Passenger = require('./models/Passenger');
const Reservation = require('./models/Reservation');
const Flight = require('./models/Flight');
const Seat = require('./models/Seat');
const Meal = require('./models/Meal');
const ResService = require('./models/ResService');
const ExtraService = require('./models/ExtraService');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// DATABASE CONNECTION
connectDB();

// MIDDLEWARE
// Parse form data (for POST requests from forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON data
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// EXPRESS SESSION
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: false
}));

// Make user data available to all
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// HANDLEBARS VIEW ENGINE
app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ROUTES
const searchRoutes = require('./routes/searchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const flightRoutes = require('./routes/flights');

app.use('/search', searchRoutes);
app.use('/booking', bookingRoutes);

// Home Page
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home',
        loggedIn: req.session.user ? true : false
    });
});

// SIGNUP ROUTES
// Show Signup Form
app.get('/signup', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('signup', { title: 'Sign Up' });
});

// Process Signup Form
app.post('/signup', async (req, res) => {
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.send('Email already registered. Please login using a new email.');
        }

        // Create new user
        const user = new ({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: 'customer'
        });

        await user.save();
        console.log('User created:', user.email);
        res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        res.send('Error creating account. Please try again.');
    }
});

// LOGIN ROUTES
// Show Login Form
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Login' });
});

// Process Login Form
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
        console.log('User logged in:', user.email);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.send('Error logging in. Please try again.');
    }
});

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
    }

    res.render('dashboard', {
        title: 'Dashboard',
        user: req.session.user
    });
});

/*
// ADMIN ROUTE
app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'admin') {
        return res.send('Access Denied. Admin only.');
    }

    res.render('admin', {
        title: 'Admin Panel',
        user: req.session.user
    });
});

// ADMIN-USERS ROUTE
app.get('/admin-users', async (req, res) => {
    res.render('admin-users', {
        title: 'Users',
        layout: 'main-admin'
    });
});

// ADMIN-RESERVATIONS ROUTE
app.get('/admin-reservations', async (req, res) => {
    res.render('admin-reservations', {
        title: 'Reservations',
        layout: 'main-admin'
    });
});*/

// CUSTOMER ROUTE
app.get('/customer', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'customer') {
        return res.send('Access Denied. Customers only.');
    }

    res.render('customer', {
        title: 'Customer Dashboard',
        user: req.session.user
    });
});

// FLIGHT ROUTE
app.use('/admin-flights', async(req, res) => {
    res.render('admin-flights', {
        title: 'Flights',
        layout: 'main-admin'
    })
});

// LOGOUT ROUTE
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// START SERVER
app.listen(PORT, () => {
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