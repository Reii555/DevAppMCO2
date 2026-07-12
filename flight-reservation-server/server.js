const connectDB = require('./database');

require('dotenv').config(); // load ung environment variables

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();