// src/config/firebase-admin.ts
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const verifyIdToken = (token) => admin.auth().verifyIdToken(token);

module.exports = { verifyIdToken };
