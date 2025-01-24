const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use local storage for development
const storage = process.env.NODE_ENV === 'development' ? 
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }) : 
  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'limit' },  // Main product image
        { width: 400, height: 400, crop: 'limit' }   // Thumbnail
      ]
    }
  });

// Create multer upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Image upload handler
const uploadImages = async (files) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      const uploadedImages = files.map(file => ({
        public_id: `mock_${Date.now()}`,
        url: `http://localhost:5000/uploads/${file.filename}`,
        secure_url: `http://localhost:5000/uploads/${file.filename}`
      }));
      return { success: true, images: uploadedImages };
    } else {
      const uploadPromises = files.map(file => 
        cloudinary.uploader.upload(file.path, {
          folder: 'products',
          resource_type: 'auto'
        })
      );
      
      const results = await Promise.all(uploadPromises);
      return results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id
      }));
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    return { success: false, error: 'Failed to upload images' };
  }
};

// Delete images
const deleteImages = async (publicIds) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Mock deletion in development
      console.log('Mock deleting images:', publicIds);
      return { success: true, message: 'Images deleted successfully' };
    } else {
      if (!Array.isArray(publicIds)) {
        publicIds = [publicIds];
      }
      
      const deletePromises = publicIds.map(publicId =>
        cloudinary.uploader.destroy(publicId)
      );
      
      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error('Error deleting images:', error);
    return { success: false, error: 'Failed to delete images' };
  }
};

module.exports = {
  upload,
  uploadImages,
  deleteImages
};
