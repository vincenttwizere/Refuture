# Render Deployment Guide for Refuture Backend

This guide will walk you through deploying your Refuture backend to Render step by step.

## Prerequisites

1. **MongoDB Atlas Account**: You'll need a MongoDB Atlas cluster for production
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account or sign in
3. Create a new cluster (M0 Free tier is sufficient for development)
4. Choose your preferred cloud provider and region

### 1.2 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Set privileges to "Read and write to any database"
5. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Render deployment)
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `refuture`

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/refuture?retryWrites=true&w=majority
```

## Step 2: Prepare Your Code for Deployment

### 2.1 Update Environment Variables
The following files have been created/updated:
- `backend/Procfile` - Tells Render how to start your app
- `backend/env.example` - Shows required environment variables

### 2.2 Commit Your Changes
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 3: Deploy to Render

### 3.1 Create a New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your Refuture project

### 3.2 Configure the Web Service

**Basic Settings:**
- **Name**: `refuture-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` (since your backend is in the backend folder)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-Deploy**: Yes (recommended)
- **Health Check Path**: `/api/health`

### 3.3 Set Environment Variables
Click on "Environment" tab and add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/refuture?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | A long, random string for JWT tokens |
| `NODE_ENV` | `production` | Environment setting |
| `ALLOWED_ORIGINS` | `https://your-frontend-domain.com,http://localhost:3000` | Comma-separated list of allowed CORS origins |

**Important Notes:**
- Replace `username:password` in MONGODB_URI with your actual MongoDB credentials
- Generate a strong JWT_SECRET (you can use a password generator)
- Update ALLOWED_ORIGINS with your frontend domain when you deploy it

### 3.4 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 2-5 minutes)

## Step 4: Verify Deployment

### 4.1 Check Health Endpoint
Once deployed, your API will be available at:
```
https://your-app-name.onrender.com/api/health
```

Test this URL in your browser - you should see:
```json
{
  "status": "OK",
  "message": "Refuture API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4.2 Check Logs
1. Go to your Render dashboard
2. Click on your web service
3. Go to "Logs" tab to see deployment and runtime logs

## Step 5: Update Frontend Configuration

Once your backend is deployed, update your frontend's API configuration:

### 5.1 Update API Base URL
In your frontend code, update the API base URL from localhost to your Render URL:

```javascript
// In src/services/api.js or similar
const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

### 5.2 Update CORS Origins
Add your frontend domain to the `ALLOWED_ORIGINS` environment variable in Render.

## Step 6: File Upload Considerations

**Important**: Render's free tier has ephemeral storage, meaning uploaded files will be lost when the service restarts. For production, consider:

1. **Cloud Storage**: Use AWS S3, Google Cloud Storage, or similar
2. **Database Storage**: Store small files as base64 in MongoDB
3. **External File Service**: Use services like Cloudinary for images

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that `backend/package.json` exists and has correct scripts
   - Verify all dependencies are listed in `dependencies` (not `devDependencies`)

2. **Database Connection Fails**
   - Verify MongoDB Atlas network access allows connections from anywhere
   - Check that your connection string is correct
   - Ensure database user has proper permissions

3. **CORS Errors**
   - Update `ALLOWED_ORIGINS` environment variable with your frontend domain
   - Check that your frontend is making requests to the correct URL

4. **Environment Variables Not Working**
   - Restart your service after adding environment variables
   - Check that variable names match exactly (case-sensitive)

### Useful Commands:
- **View Logs**: Check Render dashboard → Logs tab
- **Restart Service**: Render dashboard → Manual Deploy
- **Check Environment Variables**: Render dashboard → Environment tab

## Next Steps

1. **Set up monitoring**: Consider adding logging services
2. **Configure custom domain**: Add your own domain name
3. **Set up SSL**: Render provides this automatically
4. **Scale up**: Upgrade to paid plan for better performance
5. **Deploy frontend**: Deploy your React frontend to Vercel, Netlify, or Render

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Render Community**: [community.render.com](https://community.render.com) 