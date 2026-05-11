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
  params: async (req, file) => {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    return {
      folder: 'cosync_uploads',
      resource_type: isImage ? 'image' : 'raw',
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
    };
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
