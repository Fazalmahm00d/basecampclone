const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    console.log('Auth Middleware executing for path:', req.path);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No Bearer token found in authorization header');
        return res.status(401).json({ error: 'Unauthorized access. Token missing.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // First try to verify as a Firebase token
        try {
            const decodedFirebase = await admin.auth().verifyIdToken(token);
            console.log('Firebase token decoded:', decodedFirebase);
            
            // Find or create user based on Firebase UID
            let user = await User.findOne({ firebaseUid: decodedFirebase.uid });
            
            if (!user) {
                // Create new user if they don't exist
                user = new User({
                    email: decodedFirebase.email,
                    firebaseUid: decodedFirebase.uid,
                    provider: 'google',
                    status: 'active',
                    profilePicture: decodedFirebase.picture
                });
                await user.save();
            }
            
            req.user = user;
            next();
            return;
        } catch (firebaseError) {
            console.log('Not a Firebase token, trying JWT verification...');
        }

        // If Firebase verification fails, try regular JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT decoded in middleware:', decoded);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.log('No user found for ID:', decoded.userId);
            return res.status(401).json({ error: 'Unauthorized access. User not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({ 
            error: 'Unauthorized access. Invalid token.',
            details: error.message 
        });
    }
};

module.exports = authMiddleware;