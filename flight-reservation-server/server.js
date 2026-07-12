const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const connectDB = require('./database');
const Users = require('./models/Users');

require('dotenv').config(); // load ung environment variables

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();