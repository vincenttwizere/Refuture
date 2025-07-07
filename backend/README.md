# Refuture Backend API

A RESTful API for the Refuture platform, built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: User registration, login, and profile management
- **Profile Management**: Refugee profile creation and management
- **Opportunity Management**: Job opportunities, scholarships, and mentorship programs
- **File Upload**: Document upload functionality with Multer
- **Error Handling**: Comprehensive error handling middleware
- **Security**: Password hashing, input validation, and CORS protection

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── profileController.js  # Profile management
│   └── opportunityController.js # Opportunity management
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── uploadMiddleware.js   # File upload handling
│   └── errorHandler.js       # Error handling
├── models/
│   ├── UserModel.js          # User schema
│   ├── ProfileModel.js       # Profile schema
│   └── OpportunityModel.js   # Opportunity schema
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── profileRoutes.js      # Profile routes
│   └── opportunityRoutes.js  # Opportunity routes
├── utils/
│   ├── generateToken.js      # JWT token generation
│   └── sendEmail.js          # Email utility (placeholder)
├── uploads/                  # File storage directory
├── server.js                 # Main server file
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Profiles
- `POST /api/profiles` - Create/update profile
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get profile by ID
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### Opportunities
- `POST /api/opportunities` - Create opportunity (providers only)
- `GET /api/opportunities` - Get all opportunities
- `GET /api/opportunities/:id` - Get opportunity by ID
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity
- `GET /api/opportunities/provider/:providerId` - Get opportunities by provider

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables**:
   Create a `.env` file in the backend directory with:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/refuture
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   GMAIL_USER=your_gmail_address@gmail.com
   GMAIL_PASS=your_gmail_app_password
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM=your_verified_sender@example.com
   ```

3. **Start the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **multer**: File upload handling
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Development

The server runs on port 5001 by default. Make sure MongoDB is running locally or update the `MONGODB_URI` in your `.env` file.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- File upload restrictions

## Email Delivery Setup (SendGrid)

To enable real email notifications (e.g., for signup), add the following environment variables to your `.env` file in the backend directory:

```
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM=your_verified_sender@example.com
```
- You must use a verified sender address in your SendGrid account.
- For more info, see: https://docs.sendgrid.com/for-developers/sending-email/api-getting-started

## Email Delivery Setup

To enable real email notifications (e.g., for signup), add the following environment variables to your `.env` file in the backend directory:

```
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_gmail_app_password
```

- You must use an App Password if you have 2-Step Verification enabled on your Google account.
- Never use your main Gmail password directly.
- For more info, see: https://support.google.com/accounts/answer/185833 