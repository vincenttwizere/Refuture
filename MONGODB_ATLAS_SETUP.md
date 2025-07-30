# MongoDB Atlas Setup for Hosted Backend

This guide will help you set up MongoDB Atlas for your hosted backend at `https://refuture-backend-1.onrender.com`.

## 🎯 Prerequisites

1. **MongoDB Atlas Account** - Free tier is sufficient
2. **Render Backend** - Already deployed at `https://refuture-backend-1.onrender.com`

## 📋 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Cluster

1. **Go to MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Sign up/Login** to your account
3. **Create a new project** (if you don't have one)
4. **Build a Database**:
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider (AWS/Google Cloud/Azure)
   - Choose a region close to your users
   - Click "Create"

### Step 2: Configure Database Access

1. **Go to "Database Access"** in the left sidebar
2. **Click "Add New Database User"**
3. **Create credentials**:
   - **Username**: `refuture-user` (or your preferred username)
   - **Password**: Generate a strong password (save this!)
   - **Database User Privileges**: "Read and write to any database"
4. **Click "Add User"**

### Step 3: Configure Network Access

1. **Go to "Network Access"** in the left sidebar
2. **Click "Add IP Address"**
3. **Click "Allow Access from Anywhere"** (for Render deployment)
4. **Click "Confirm"**

### Step 4: Get Connection String

1. **Go to "Database"** in the left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Copy the connection string**

Your connection string will look like this:
```
mongodb+srv://refuture-user:your-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Update Connection String

**Replace the placeholders**:
- Replace `<password>` with your actual database password
- Add `/refuture` at the end to specify the database name

**Final connection string should look like**:
```
mongodb+srv://refuture-user:your-actual-password@cluster0.xxxxx.mongodb.net/refuture?retryWrites=true&w=majority
```

### Step 6: Set Environment Variables in Render

1. **Go to your Render dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Click on your backend service** (`refuture-backend-1`)
3. **Go to "Environment" tab**
4. **Add/Update these variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://refuture-user:your-actual-password@cluster0.xxxxx.mongodb.net/refuture?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | A long, random string for JWT tokens |
| `NODE_ENV` | `production` | Environment setting |
| `ALLOWED_ORIGINS` | `https://your-frontend-domain.com,http://localhost:3000,http://localhost:5173` | Comma-separated list of allowed CORS origins |

### Step 7: Restart Your Backend

1. **Go to your Render service**
2. **Click "Manual Deploy"**
3. **Wait for deployment to complete**

## ✅ Verification

### Test Database Connection

1. **Check Render logs** for successful MongoDB connection
2. **Test the health endpoint**:
   ```bash
   curl https://refuture-backend-1.onrender.com/api/health
   ```

3. **Test user registration**:
   - Go to your frontend
   - Try creating a new account
   - Check if the user is saved in MongoDB Atlas

### Check MongoDB Atlas

1. **Go to your MongoDB Atlas dashboard**
2. **Click "Browse Collections"**
3. **Look for the `refuture` database**
4. **Check for collections like `users`, `opportunities`, etc.**

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Verify your connection string format
   - Check that username/password are correct
   - Ensure network access allows connections from anywhere

2. **Authentication Failed**
   - Double-check username and password
   - Make sure special characters in password are URL-encoded

3. **Database Not Found**
   - Add `/refuture` to the end of your connection string
   - The database will be created automatically on first use

### Debug Commands:

```bash
# Test connection string format
echo "mongodb+srv://username:password@cluster.mongodb.net/refuture?retryWrites=true&w=majority"

# Test backend health
curl https://refuture-backend-1.onrender.com/api/health

# Check Render logs
# Go to Render dashboard → Logs tab
```

## 🔐 Security Notes

1. **Password**: Use a strong, unique password for your database user
2. **Network Access**: For production, consider restricting IP addresses
3. **Environment Variables**: Never commit connection strings to git
4. **JWT Secret**: Use a strong, random string for production

## 📞 Support

- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Check Render logs** for detailed error messages

## 🎉 Next Steps

Once MongoDB is connected:
1. **Test user registration** in your frontend
2. **Create some test data** to verify everything works
3. **Deploy your frontend** to complete the full stack
4. **Monitor your application** using MongoDB Atlas and Render dashboards 