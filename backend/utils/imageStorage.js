const fs = require('fs');
const path = require('path');
const cloudinary = require('./cloudinary');
const { backendUrl } = require('./appUrls');

const cloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const removeLocalFile = (filepath) => {
  if (!filepath) return;
  fs.unlink(filepath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to remove local upload:', err.message);
    }
  });
};

/**
 * Persists an uploaded image and returns a URL that a browser can load.
 *
 * Multer is configured with disk storage, so `file.buffer` is undefined —
 * the previous code streamed that undefined buffer to Cloudinary, which meant
 * category images either errored out or silently vanished. Read from
 * `file.path` instead, and fall back to serving the file from this API when
 * Cloudinary is not configured.
 */
const saveUploadedImage = async (file, folder) => {
  if (!file) return null;

  if (cloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image',
      });
      removeLocalFile(file.path);
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed, keeping local copy:', error.message);
    }
  }

  // Absolute URL: the SPA is served from a different origin than /uploads.
  return `${backendUrl()}/uploads/${file.filename}`;
};

/** Deletes a previously stored image, whether it lives on Cloudinary or on disk. */
const deleteStoredImage = async (imageUrl) => {
  if (!imageUrl) return;

  const uploadsMarker = '/uploads/';
  if (imageUrl.includes(uploadsMarker)) {
    const filename = imageUrl.split(uploadsMarker).pop();
    if (filename) {
      removeLocalFile(path.join(__dirname, '../public/uploads', filename));
    }
    return;
  }

  if (!cloudinaryConfigured()) return;

  try {
    const parts = imageUrl.split('/');
    const folderAndFile = parts.slice(-2).join('/');
    const publicId = folderAndFile.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { saveUploadedImage, deleteStoredImage, cloudinaryConfigured };
