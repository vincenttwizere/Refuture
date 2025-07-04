# Development Checklist

## Before Starting Development:
- [ ] Make sure MongoDB is running (if using local database)
- [ ] Check if `.env` file exists in backend folder
- [ ] Ensure all dependencies are installed (`npm install` in both root and backend)

## Starting the Application:
### Option 1: Combined (Recommended)
```bash
npm run dev:full
```
This starts both frontend and backend simultaneously.

### Option 2: Separate (if you need to debug one service)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

## Common Issues & Solutions:

### ERR_CONNECTION_REFUSED
- **Cause**: Backend server not running
- **Solution**: Start backend with `npm run dev:server` or use `npm run dev:full`

### MongoDB Connection Error
- **Cause**: MongoDB not running
- **Solution**: Start MongoDB service or use MongoDB Atlas

### Port Already in Use
- **Cause**: Another process using port 5001
- **Solution**: Kill the process or change port in `.env`

## Quick Commands:
- `npm run dev:full` - Start both frontend and backend
- `npm run dev` - Start frontend only
- `npm run dev:server` - Start backend only
- `npm run build` - Build for production 