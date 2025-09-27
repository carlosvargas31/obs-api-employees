const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

const User = require('../models/user.model');

module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    try {
      const dbUser = await User.findById(user.id);
      if (!dbUser) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }
      req.user = user;
      next();
    } catch (e) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
};
