# MongoDB Connection String - Exact File Locations

## 🎯 **Where to Put Your MongoDB Connection String**

### **For Production (Hosted Backend)**

**Location: Render Dashboard Environment Variables**

1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Click on your service**: `refuture-backend-1`
3. **Go to "Environment" tab**
4. **Add/Update this variable**:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/refuture?retryWrites=true&w=majority` |

**Example:**
```
MONGODB_URI=mongodb+srv://refuture-user:mypassword123@cluster0.abc123.mongodb.net/refuture?retryWrites=true&w=majority
```

### **For Local Development**

**Location: `backend/.env` file**

1. **Create a file** called `.env` in the `backend` folder
2. **Add your connection string**:

```env
# Backend Environment Variables
NODE_ENV=development
PORT=5001

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/refuture?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
```

## 📁 **File Structure**

```
Refuture/
├── backend/
│   ├── .env                    ← PUT YOUR CONNECTION STRING HERE (local)
│   ├── config.js               ← Reads from environment variables
│   ├── server.js               ← Uses MONGODB_URI from config
│   └── env.example             ← Example template
├── src/
│   └── services/
│       └── api.js              ← Frontend API configuration
└── .env                        ← Frontend environment variables
```

## 🔧 **How It Works**

1. **`backend/config.js`** - Reads the connection string from environment variables
2. **`backend/server.js`** - Uses the connection string to connect to MongoDB
3. **Environment variables** - Store the actual connection string securely

## 📝 **Step-by-Step Instructions**

### **Step 1: Get Your MongoDB Atlas Connection String**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

### **Step 2: Update Connection String**

**Replace the placeholders:**
- Replace `<password>` with your actual password
- Add `/refuture` at the end to specify database name

**Before:**
```
mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://username:your-actual-password@cluster.mongodb.net/refuture?retryWrites=true&w=majority
```

### **Step 3: Set Environment Variable**

**For Production (Render):**
1. Go to Render dashboard → Environment tab
2. Add `MONGODB_URI` with your connection string
3. Click "Save Changes"
4. Restart your service

**For Local Development:**
1. Create `backend/.env` file
2. Add your connection string
3. Restart your backend server

## ✅ **Verification**

### **Test Local Connection:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
📊 Database URL: mongodb+srv://...
```

### **Test Production Connection:**
```bash
npm run test:mongodb
```

## ⚠️ **Important Notes**

1. **Never commit connection strings to git**
2. **Use environment variables for production**
3. **URL-encode special characters in passwords**
4. **Restart your service after changing environment variables**

## 🔐 **Security Checklist**

- [ ] Use strong passwords
- [ ] Don't commit `.env` files to git
- [ ] Use environment variables in production
- [ ] Regularly rotate database passwords
- [ ] Restrict network access when possible 