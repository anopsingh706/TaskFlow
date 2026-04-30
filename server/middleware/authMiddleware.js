const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');

/**
 * Protect routes — verifies JWT from Authorization header
 * Attaches req.user to the request if valid
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  try {
    const decoded = verifyToken(token);
    // Attach user to request (without password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized — user no longer exists');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized — token invalid or expired');
  }
});

module.exports = { protect };
