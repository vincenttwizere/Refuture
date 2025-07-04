import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken; 