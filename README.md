# Refuture Platform

A comprehensive platform connecting refugees with opportunities for employment, education, and community integration.

## Features

### For Refugees
- Create detailed profiles showcasing skills and experience
- Browse and apply for opportunities (jobs, internships, scholarships)
- Manage applications and track progress
- Receive notifications and messages

### For Providers (Employers/Organizations)
- Post opportunities (jobs, internships, scholarships, mentorship)
- Browse refugee talent profiles
- Manage applications and interviews
- Communicate with candidates

### For Administrators
- User management and approval system
- Platform analytics and reporting
- Content moderation
- System monitoring

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication
- **Database**: MongoDB (local or Atlas)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Quick Start

### Option 1: Using the Batch Script (Windows)
1. Clone the repository
2. Install dependencies: `npm install`
3. Run `start-dev.bat` to start both servers

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Database Setup
You have two options:

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- The app will connect to `mongodb://localhost:27017/refuture`

**Option B: MongoDB Atlas**
- Create a MongoDB Atlas account
- Create a cluster and get your connection string
- Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5001
NODE_ENV=development
```

#### 3. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Opportunities
- `GET /api/opportunities` - Get all opportunities
- `POST /api/opportunities` - Create opportunity (Provider/Admin)
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### Profiles
- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/:id` - Update profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get platform statistics
- `PUT /api/users/:id/status` - Update user status

## User Roles

### Refugee
- Can create and manage profiles
- Browse and apply for opportunities
- Receive notifications and messages

### Provider
- Can post opportunities
- Browse refugee profiles
- Manage applications and interviews

### Admin
- Full platform management
- User approval and moderation
- Analytics and reporting

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: MongoDB connection error
```
**Solution**: Ensure MongoDB is running locally or your Atlas connection string is correct.

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5001
```
**Solution**: Kill the process using port 5001 or change the port in backend/.env

**3. CORS Errors**
```
Access to fetch at 'http://localhost:5001/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: The backend is configured to allow CORS from the frontend. Ensure both servers are running.

**4. JWT Token Issues**
```
Error: Not authorized, token failed
```
**Solution**: Clear browser localStorage and log in again.

### Development Tips

1. **Check Console Logs**: Both frontend and backend have detailed logging
2. **Network Tab**: Use browser dev tools to inspect API requests
3. **Database**: Use MongoDB Compass to inspect your database
4. **Environment Variables**: Ensure all required env vars are set

## File Structure

```
Refuture/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── controllers/        # API controllers
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── src/                   # Frontend React app
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   └── profiles/     # Profile components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   └── services/         # API services
└── uploads/              # File uploads
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 