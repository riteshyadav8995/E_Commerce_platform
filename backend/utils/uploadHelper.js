const prisma = require('../utils/prisma');
const cloudinary = require('../utils/cloudinary');
const { uploadToCloudinary, deleteFromCloudinary } = require('./upload');

// Helper to stream buffer to Cloudinary
const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { streamUpload };
