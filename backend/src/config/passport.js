const passport = require('passport');
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');
const { verifyIdToken } = require('./firebase-admin');
const User = require('../models/User');

// Firebase Strategy
passport.use('firebase', new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'placeholder', // Not actually used
  passReqToCallback: true
}, async (req, payload, done) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || '';
    const decoded = await verifyIdToken(token);
    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      { $set: { email: decoded.email } },
      { upsert: true, new: true }
    );
    done(null, user);
  } catch (error) {
    done(error);
  }
}));