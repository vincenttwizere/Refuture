# MongoDB Setup Guide

## 🚨 Issue: MongoDB Not Running

The signup is failing because MongoDB is not installed or not running. The backend needs a database to store user data.

## 🔧 Solutions

### Option 1: MongoDB Atlas (Cloud) - RECOMMENDED

**Step 1: Create MongoDB Atlas Account**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

**Step 2: Create Database Cluster**
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region close to you
5. Click "Create"

**Step 3: Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

**Step 4: Create Environment File**
Create a file called `.env` in the `backend` folder:

```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/refuture?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
```

**Step 5: Restart Backend**
```bash
cd backend
npm run dev
```

### Option 2: Local MongoDB Installation

**Step 1: Download MongoDB**
1. Go to [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for Windows
3. Run the installer with default settings

**Step 2: Start MongoDB**
- MongoDB should start automatically as a Windows service
- Or start manually: `net start MongoDB`

**Step 3: Restart Backend**
```bash
cd backend
npm run dev
```

## ✅ Verification

After setup, you should see:
```
Connected to MongoDB
🚀 Server running on port 5001
```

## 🧪 Test Signup

Once MongoDB is connected:
1. Go to http://localhost:5173
2. Try creating a new account
3. Signup should work without "Unable to reach server" error

## 📞 Support

If you need help:
1. Check MongoDB Atlas documentation
2. Verify connection string format
3. Ensure backend is restarted after changes 