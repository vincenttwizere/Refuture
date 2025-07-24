# Refuture - Complete Setup Guide

This guide will help you set up the complete Refuture application with both frontend and backend running locally.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Backend Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The backend will automatically connect to `mongodb://localhost:27017/refuture`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Create a `.env` file in the `backend` folder:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your-super-secret-jwt-key
   ```

#### Start Backend
```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5001`

### 2. Frontend Setup

```bash
# In the root directory
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
Refuture/
├── backend/                 # Backend API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── uploads/            # File uploads
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   └── contexts/           # React contexts
└── package.json            # Frontend dependencies
```

## 🔧 Configuration

### Backend Configuration
The backend uses these default settings:
- **Port**: 5001
- **Database**: MongoDB
- **Authentication**: JWT
- **CORS**: Enabled for localhost:3000, 3001, 5173

### Frontend Configuration
The frontend is configured to connect to:
- **API Base URL**: `http://localhost:5001/api`
- **Development Server**: `http://localhost:5173`

## 🗄️ Database Models

### User
- Authentication and user management
- Roles: refugee, provider, admin
- Profile information

### Profile
- Refugee profile details
- Education, work experience, skills
- Languages and certifications

### Opportunity
- Job opportunities posted by providers
- Requirements, salary, location
- Application tracking

### Application
- Job applications by refugees
- Status tracking
- Cover letters and documents

### Interview
- Interview scheduling
- Provider-talent communication
- Status management

### Message
- Internal messaging system
- File attachments support

### Notification
- System notifications
- Real-time updates

## 🔐 Authentication

The system uses JWT-based authentication:

1. **Signup**: Create account with role (refugee/provider)
2. **Login**: Get JWT token
3. **Authorization**: Role-based access control
4. **Token Storage**: LocalStorage (frontend)

## 🚀 Running the Application

### Development Mode

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001/api
   - Health Check: http://localhost:5001/api/health

### Production Mode

1. **Build Frontend**:
   ```bash
   npm run build
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

## 🧪 Testing the Setup

### 1. Health Check
Visit `http://localhost:5001/api/health` to verify backend is running.

### 2. Create Test Users
Use the signup form to create:
- A refugee account
- A provider account

### 3. Test Features
- Refugee: Create profile, browse opportunities, apply for jobs
- Provider: Post opportunities, review applications, schedule interviews

## 🔧 Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Try MongoDB Atlas if local setup fails

2. **Port Already in Use**:
   - Change port in `backend/config.js`
   - Update frontend API base URL

3. **JWT Errors**:
   - Check JWT_SECRET in environment
   - Clear localStorage and re-login

### Frontend Issues

1. **API Connection Errors**:
   - Verify backend is running on port 5001
   - Check CORS configuration
   - Clear browser cache

2. **Authentication Issues**:
   - Clear localStorage
   - Check token expiration
   - Verify JWT secret matches

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Opportunities Endpoints
- `GET /api/opportunities` - List opportunities
- `POST /api/opportunities` - Create opportunity
- `GET /api/opportunities/:id` - Get opportunity details

### Applications Endpoints
- `POST /api/applications` - Submit application
- `GET /api/applications/user` - Get user applications
- `PUT /api/applications/:id/status` - Update status

### Interviews Endpoints
- `POST /api/interviews/invite` - Send invitation
- `GET /api/interviews/talent` - Get talent interviews
- `PUT /api/interviews/:id/respond` - Respond to invitation

## 🎯 Next Steps

1. **Add Real Data**: Create sample opportunities and profiles
2. **Test All Features**: Verify refugee and provider workflows
3. **Customize UI**: Modify styling and branding
4. **Add Features**: Implement additional functionality
5. **Deploy**: Set up production deployment

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all services are running
3. Check network connectivity
4. Review this setup guide

## 🎉 Success!

Once everything is running, you should have:
- ✅ Backend API on port 5001
- ✅ Frontend app on port 5173
- ✅ MongoDB database connected
- ✅ Authentication working
- ✅ All features functional

You can now start using the Refuture platform! 