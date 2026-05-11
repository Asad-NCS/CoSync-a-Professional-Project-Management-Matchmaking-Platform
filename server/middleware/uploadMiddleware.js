const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'cosync_uploads',
      resource_type: isImage ? 'image' : 'raw',
      // Keep the full name with extension for raw files so they are easy to open
      public_id: file.originalname,
    };
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
