import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken; 