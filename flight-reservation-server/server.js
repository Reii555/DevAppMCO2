const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const connectDB = require('./config/database');
const Users = require('./models/Users');

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

// Make user data available to all templates
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
        const existingUser = await Users.findOne({ email: req.body.email });
        if (existingUser) {
            return res.send('Email already registered. Please login using a new email.');
        }

        // Create new user
        const user = new Users({
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
        const user = await Users.findOne({
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