# Refuture Backend API

A complete backend API for the Refuture platform, built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: User registration, login, and profile management
- **Opportunities**: Job posting and management for providers
- **Applications**: Job application system for refugees
- **Interviews**: Interview scheduling and management
- **Messaging**: Internal messaging system
- **Notifications**: System notifications
- **Profiles**: Refugee profile management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/refuture
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   ```

3. **Start MongoDB**:
   Make sure MongoDB is running on your system or use a cloud instance.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Opportunities
- `GET /api/opportunities` - Get all opportunities (with filtering)
- `GET /api/opportunities/:id` - Get opportunity by ID
- `POST /api/opportunities` - Create new opportunity (Providers only)
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity
- `POST /api/opportunities/:id/save` - Save/unsave opportunity
- `GET /api/opportunities/saved` - Get saved opportunities

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles` - Create profile (Refugees only)
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### Applications
- `GET /api/applications/user` - Get user's applications (Refugees)
- `GET /api/applications/provider` - Get provider's applications
- `GET /api/applications/opportunity/:id` - Get applications for opportunity
- `POST /api/applications` - Create application (Refugees only)
- `PUT /api/applications/:id/status` - Update application status
- `GET /api/applications/:id` - Get application by ID

### Interviews
- `GET /api/interviews/provider` - Get provider interviews
- `GET /api/interviews/talent` - Get talent interviews
- `POST /api/interviews/invite` - Send interview invitation
- `PUT /api/interviews/:id/respond` - Respond to interview invitation
- `GET /api/interviews/:id` - Get interview by ID

### Messages
- `GET /api/messages` - Get all messages for user
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

## Database Models

- **User**: Authentication and user management
- **Profile**: Refugee profile information
- **Opportunity**: Job opportunities posted by providers
- **Application**: Job applications submitted by refugees
- **Interview**: Interview scheduling and management
- **Message**: Internal messaging system
- **Notification**: System notifications

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with express-validator
- Rate limiting
- CORS configuration
- Helmet security headers

## Error Handling

The API includes comprehensive error handling with:
- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- General server errors

All errors return consistent JSON responses with appropriate HTTP status codes.

## Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # File uploads
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Adding New Features

1. Create model in `models/` directory
2. Create routes in `routes/` directory
3. Add route to `server.js`
4. Update documentation

## Testing

To test the API endpoints, you can use tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Set up proper MongoDB connection (Atlas recommended)
4. Configure environment variables
5. Set up proper logging
6. Configure CORS for your domain
7. Set up SSL/TLS certificates

## Support

For issues and questions, please refer to the main project documentation or create an issue in the repository. 