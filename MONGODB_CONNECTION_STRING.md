# MongoDB Connection String Reference

## 🔗 Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## 📝 Example for Refuture

```
mongodb+srv://refuture-user:your-password@cluster0.xxxxx.mongodb.net/refuture?retryWrites=true&w=majority
```

## 🔧 Components Breakdown

| Component | Description | Example |
|-----------|-------------|---------|
| `mongodb+srv://` | Protocol | `mongodb+srv://` |
| `username` | Database username | `refuture-user` |
| `password` | Database password | `your-actual-password` |
| `cluster.mongodb.net` | Your cluster URL | `cluster0.xxxxx.mongodb.net` |
| `database` | Database name | `refuture` |
| `retryWrites=true` | Connection options | `retryWrites=true&w=majority` |

## ⚠️ Important Notes

1. **Password Encoding**: If your password contains special characters, URL-encode them:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `$` becomes `%24`
   - `%` becomes `%25`

2. **Database Name**: Add `/refuture` at the end to specify your database

3. **Network Access**: Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

## 🧪 Test Your Connection String

```bash
# Test the connection
npm run test:mongodb

# Or test manually
curl -X POST https://refuture-backend-1.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123","role":"refugee"}'
```

## 🔐 Security Checklist

- [ ] Use a strong password
- [ ] Don't commit connection string to git
- [ ] Use environment variables in Render
- [ ] Consider restricting IP access for production
- [ ] Regularly rotate database passwords

## 📞 Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check username and password
   - URL-encode special characters in password

2. **Connection Timeout**
   - Verify network access allows connections from anywhere
   - Check cluster is running

3. **Database Not Found**
   - Add `/refuture` to the end of connection string
   - Database will be created automatically

### Debug Steps:

1. **Check Render logs** for connection errors
2. **Test connection string** in MongoDB Compass
3. **Verify environment variables** are set correctly in Render
4. **Restart Render service** after updating environment variables 