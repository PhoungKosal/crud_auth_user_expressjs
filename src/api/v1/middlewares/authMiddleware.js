const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
      // Get token from headers
      const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;
  
      if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing' });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Log decoded payload for debugging
      console.log(decoded);
  
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
  
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized' });
    }
});
  
const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role !== 'admin') {
      res.status(401).json({ error: 'Not authorized' });
    } else {
      next();
    }
});

module.exports = {
    authMiddleware,
    isAdmin,
};