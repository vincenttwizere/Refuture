const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const opportunitiesRoutes = require('./routes/opportunities');
const profilesRoutes = require('./routes/profiles');
const interviewsRoutes = require('./routes/interviews');
const applicationsRoutes = require('./routes/applications');
const messagesRoutes = require('./routes/messages');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');

// Import models
const Opportunity = require('./models/Opportunity');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware with adjusted CSP for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5001", "http://localhost:5173"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow specific origins from environment variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://localhost:5174', 
          'http://localhost:5175',
          'http://localhost:5176',
          'http://localhost:5177',
          'http://localhost:5178',
          'http://localhost:5179',
          'http://localhost:5180'
        ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - more generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs (increased from 5000)
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
});
app.use('/api/', limiter);

// More lenient rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20000, // limit each IP to 20000 requests per windowMs for auth
  message: {
    success: false,
    message: 'Too many authentication requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});

// Apply more lenient rate limiting to auth routes
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}));

// Static file serving for uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for image files (proven solution)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('Backend - Static file request:', req.url);
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/refuture', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log('📊 Database URL:', process.env.MONGODB_URI || 'mongodb://localhost:27017/refuture');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('🔍 Error details:', {
    name: err.name,
    message: err.message,
    code: err.code
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Refuture API is running',
    timestamp: new Date().toISOString()
  });
});

// Manual trigger for expired opportunities cleanup (for testing)
app.post('/api/admin/cleanup-expired-opportunities', async (req, res) => {
  try {
    const deactivatedCount = await Opportunity.deactivateExpiredOpportunities();
    res.json({
      success: true,
      message: `Successfully deactivated ${deactivatedCount} expired opportunities`,
      deactivatedCount
    });
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cleanup',
      error: error.message
    });
  }
});

// Proxy route for serving images with CORS headers
app.get('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', filename);
  
  console.log('Backend - Serving image:', filename);
  console.log('Backend - Image path:', imagePath);
  
  // Set CORS headers (proven solution)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Check if file exists
  const fs = require('fs');
  if (!fs.existsSync(imagePath)) {
    console.log('Backend - Image not found:', imagePath);
    return res.status(404).json({ error: 'Image not found' });
  }
  
  // Serve the image
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Backend - Error serving image:', err);
      res.status(500).json({ error: 'Error serving image' });
    } else {
      console.log('Backend - Image served successfully:', filename);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  
  // Schedule task to deactivate expired opportunities
  scheduleExpiredOpportunitiesCleanup();
});

// Function to schedule expired opportunities cleanup
function scheduleExpiredOpportunitiesCleanup() {
  // Run immediately on startup
  deactivateExpiredOpportunities();
  
  // Then run every hour
  setInterval(deactivateExpiredOpportunities, 60 * 60 * 1000); // 1 hour
  
  console.log('🕐 Scheduled expired opportunities cleanup (runs every hour)');
}

// Function to deactivate expired opportunities
async function deactivateExpiredOpportunities() {
  try {
    const deactivatedCount = await Opportunity.deactivateExpiredOpportunities();
    if (deactivatedCount > 0) {
      console.log(`✅ Deactivated ${deactivatedCount} expired opportunities`);
    }
  } catch (error) {
    console.error('❌ Error in expired opportunities cleanup:', error);
  }
}

module.exports = app; 