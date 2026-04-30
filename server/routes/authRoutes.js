const express  = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');
const {
  register, login, logout, getMe,
  updateProfile, changePassword, getUsers,
} = require('../controllers/authController');
const { protect }      = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../config/cloudinary');
const { generateToken } = require('../utils/generateToken');

const router = express.Router();

// ─── Validation ────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileValidation = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// ─── Standard Auth Routes ──────────────────────────────────
router.post('/register',         registerValidation,        register);
router.post('/login',            loginValidation,           login);
router.post('/logout',           protect,                   logout);
router.get('/me',                protect,                   getMe);
router.get('/users',             protect,                   getUsers);
router.put('/profile',           protect, uploadAvatar.single('avatar'), profileValidation, updateProfile);
router.put('/change-password',   protect, changePasswordValidation,     changePassword);

// ─── Google OAuth 2.0 Routes ──────────────────────────────
/**
 * STEP 1 — Initiate OAuth flow
 * Frontend opens: window.location.href = '/api/auth/google'
 * (or an <a> tag pointing to this URL)
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account', // always show account picker
  })
);

/**
 * STEP 2 — Google redirects here after user consents
 * We generate a JWT and redirect to the frontend with it in the URL hash.
 * The frontend reads it, stores it, and navigates to /dashboard.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    // req.user is populated by Passport after successful authentication
    const token = generateToken(req.user._id);

    // Redirect to frontend with token in URL hash (never in query string — logs/referrers)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback#token=${token}`);
  }
);

module.exports = router;