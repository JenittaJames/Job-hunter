const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy for rate limiter (Render/Heroku deployments)
app.set('trust proxy', 1);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Set security headers
app.use(helmet());

// Prevent NoSQL injections
app.use(mongoSanitize());

// Enable CORS with strict origins
app.use(cors({
  origin: ['http://localhost:4200', 'https://job-hunter-ymhr.onrender.com', 'https://job-hunter-six-weld.vercel.app', 'https://job-hunter2026.vercel.app'],
  credentials: true
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/auth', authLimiter);


// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/outreach', require('./routes/outreachRoutes'));
app.use('/api/networking', require('./routes/networkingRoutes'));
app.use('/api/followups', require('./routes/followUpRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('Job Hunt Tracker API is running...');
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
