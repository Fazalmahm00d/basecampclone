const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Cloudinary folder name
    // format: async (req, file) => file.mimetype.split('/')[1], // Auto-detect format
    // public_id: (req, file) => Date.now() + '-' + file.originalname
    resource_type: "raw", 
  }
});

// Multer middleware using Cloudinary storage
const upload = multer({ storage });

module.exports = upload;


// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Ensure the 'uploads/' directory exists
//   },
//   filename: function (req, file, cb) {
//     // Keep the original filename and add a timestamp to avoid conflicts
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
