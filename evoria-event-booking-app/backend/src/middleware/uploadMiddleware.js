const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure uploads folder exists for local development fallback
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only common image types
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, or WEBP images are allowed'), false);
  }
  cb(null, true);
};

const storage = hasCloudinaryConfig ? multer.memoryStorage() : diskStorage;
const upload = multer({ storage, fileFilter });

const uploadImageToCloudinary = (file) => {
  if (!hasCloudinaryConfig || !file) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'evoria',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        const url = result?.secure_url;
        if (!url) {
          return reject(new Error('Cloudinary returned no URL'));
        }
        return resolve(url);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const resolveStoredImagePath = async (file) => {
  if (!file) return null;
  if (hasCloudinaryConfig) {
    return uploadImageToCloudinary(file);
  }
  return `/uploads/${file.filename}`;
};

module.exports = { upload, resolveStoredImagePath, hasCloudinaryConfig };
