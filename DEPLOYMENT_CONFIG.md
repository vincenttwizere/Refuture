# Deployment Configuration Guide

This guide will help you configure your Refuture application for your hosted backend and database.

## 🚀 Quick Start

### 1. Configure for Development (Local Backend)
```bash
npm run config:dev
npm run dev
```

### 2. Configure for Production (Hosted Backend)
```bash
npm run config:prod
# Edit .env file with your actual backend URL
npm run build:prod
```

## 📋 Configuration Steps

### Step 1: Update Your Backend URL

1. **Get your Render app URL** from your Render dashboard
   - Format: `https://your-app-name.onrender.com`

2. **Update the production environment file**:
   ```bash
   npm run config:prod
   ```

3. **Edit the `.env` file** and replace `YOUR_RENDER_APP_NAME` with your actual app name:
   ```
   VITE_API_BASE_URL=https://your-actual-app-name.onrender.com/api
   ```

### Step 2: Verify Backend Configuration

Make sure your backend has these environment variables set in Render:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/refuture?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | A long, random string for JWT tokens |
| `NODE_ENV` | `production` | Environment setting |
| `ALLOWED_ORIGINS` | `https://your-frontend-domain.com,http://localhost:3000` | Comma-separated list of allowed CORS origins |

### Step 3: Test Your Configuration

1. **Test Backend Health**:
   ```bash
   curl https://your-app-name.onrender.com/api/health
   ```

2. **Test Frontend Connection**:
   - Run `npm run config:prod`
   - Start development server: `npm run dev`
   - Check browser console for API connection errors

## 🔧 Environment Files

### Development (`env.development`)
```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=Refuture (Development)
```

### Production (`env.production`)
```
VITE_API_BASE_URL=https://YOUR_RENDER_APP_NAME.onrender.com/api
VITE_APP_NAME=Refuture
```

## 📦 Build Commands

| Command | Description |
|---------|-------------|
| `npm run config:dev` | Switch to development configuration |
| `npm run config:prod` | Switch to production configuration |
| `npm run build:dev` | Build for development (localhost backend) |
| `npm run build:prod` | Build for production (hosted backend) |

## 🌐 CORS Configuration

Your backend CORS is configured to allow:
- Localhost on any port (development)
- Specific origins from `ALLOWED_ORIGINS` environment variable

To add your frontend domain:
1. Go to Render dashboard → Environment variables
2. Add/update `ALLOWED_ORIGINS` with your frontend domain
3. Restart your Render service

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check that your frontend domain is in `ALLOWED_ORIGINS`
   - Verify the API URL is correct in `.env`

2. **API Connection Failed**
   - Test your backend health endpoint
   - Check Render logs for errors
   - Verify environment variables are set correctly

3. **Build Errors**
   - Make sure all dependencies are installed
   - Check that `.env` file exists and is properly formatted

### Debug Commands:

```bash
# Check current environment configuration
cat .env

# Test backend health
curl https://your-app-name.onrender.com/api/health

# Check build output
npm run build:prod
```

## 📱 Frontend Deployment

Once configured, deploy your frontend to:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Render**: Upload the `dist` folder

## 🔐 Security Notes

1. **Environment Variables**: Never commit `.env` files to git
2. **JWT Secret**: Use a strong, random string for production
3. **CORS**: Only allow necessary origins
4. **HTTPS**: Always use HTTPS in production

## 📞 Support

- Check Render logs for backend issues
- Check browser console for frontend issues
- Verify environment variables are correctly set 