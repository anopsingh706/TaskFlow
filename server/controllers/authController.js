const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

// ─── @desc    Register new user
// ─── @route   POST /api/auth/register
// ─── @access  Public
const register = asyncHandler(async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Create new user — password hashed by pre-save hook in model
  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toPublicJSON(),
  });
});

// ─── @desc    Login user
// ─── @route   POST /api/auth/login
// ─── @access  Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Find user and explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Mark user as online
  user.status = 'online';
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: user.toPublicJSON(),
  });
});

// ─── @desc    Logout user
// ─── @route   POST /api/auth/logout
// ─── @access  Private
const logout = asyncHandler(async (req, res) => {
  // Mark user as offline
  await User.findByIdAndUpdate(req.user._id, {
    status: 'offline',
    lastSeen: new Date(),
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ─── @desc    Get current logged-in user
// ─── @route   GET /api/auth/me
// ─── @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    user: user.toPublicJSON(),
  });
});

// ─── @desc    Update profile (name + avatar)
// ─── @route   PUT /api/auth/profile
// ─── @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name } = req.body;
  const updateData = {};

  if (name) updateData.name = name.trim();

  // Upload avatar buffer to Cloudinary via stream
  if (req.file && req.file.buffer) {
    const { uploadToCloudinary } = require('../config/cloudinary');
    const publicId = `avatar_${req.user._id}`;
    updateData.avatar = await uploadToCloudinary(req.file.buffer, publicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toPublicJSON(),
  });
});

// ─── @desc    Change password
// ─── @route   PUT /api/auth/change-password
// ─── @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// ─── @desc    Get all users (for chat user search)
// ─── @route   GET /api/auth/users
// ─── @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const query = {
    _id: { $ne: req.user._id }, // Exclude current user
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query).select('name email avatar status lastSeen').limit(20);

  res.json({
    success: true,
    users,
  });
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword, getUsers };