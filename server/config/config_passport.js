/**
 * Passport Google OAuth 2.0 Strategy
 *
 * Flow:
 *  1. User clicks "Sign in with Google" on frontend
 *  2. Browser redirects to GET /api/auth/google
 *  3. Passport redirects to Google's consent screen
 *  4. Google redirects back to GET /api/auth/google/callback with a code
 *  5. Passport exchanges the code for profile data
 *  6. We find or create a User in MongoDB
 *  7. We generate a JWT and redirect to the frontend with it
 */

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email     = profile.emails?.[0]?.value;
        const name      = profile.displayName;
        const avatar    = profile.photos?.[0]?.value;
        const googleId  = profile.id;

        if (!email) {
          return done(new Error('No email returned from Google'), null);
        }

        // Try to find an existing user by googleId first, then by email
        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.findOne({ email });

          if (user) {
            // User registered with email — link their Google account
            user.googleId = googleId;
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save({ validateBeforeSave: false });
          } else {
            // Brand new user — create account (no password needed for OAuth users)
            user = await User.create({
              name,
              email,
              avatar:   avatar || '',
              googleId,
              password: `google_oauth_${googleId}_${Date.now()}`, // placeholder, never used
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// We don't use sessions — JWT only — so these are minimal stubs
passport.serializeUser((user, done)   => done(null, user._id));
passport.deserializeUser((id, done)   => User.findById(id).then(u => done(null, u)).catch(done));

module.exports = passport;
