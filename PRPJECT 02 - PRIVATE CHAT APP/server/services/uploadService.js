const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check Cloudinary configuration
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[UploadService] Cloudinary configured and active');
} else {
  console.log('[UploadService] Cloudinary credentials not configured; using local static storage fallback');
}

/**
 * Upload buffer to Cloudinary or save to local disk
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - { folder, resource_type, filename, mimetype }
 * @returns {Promise<Object>} - { url, public_id, size, format }
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const resourceType = options.resource_type || 'auto';
    const folder = options.folder || 'chat_app';
    const originalName = options.filename || `file_${Date.now()}`;

    if (isCloudinaryConfigured) {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url || result.url,
            public_id: result.public_id,
            size: result.bytes,
            format: result.format
          });
        }
      );
      stream.end(buffer);
    } else {
      // Local fallback
      const ext = path.extname(originalName) || (options.mimetype?.includes('audio') ? '.webm' : '.dat');
      const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const destPath = path.join(uploadsDir, safeFilename);

      fs.writeFile(destPath, buffer, (err) => {
        if (err) {
          console.error('[Local Storage Error]', err);
          return reject(err);
        }
        const port = process.env.PORT || 5000;
        const localUrl = `http://localhost:${port}/uploads/${safeFilename}`;
        resolve({
          url: localUrl,
          public_id: safeFilename,
          size: buffer.length,
          format: ext.replace('.', '')
        });
      });
    }
  });
};

module.exports = {
  isCloudinaryConfigured,
  uploadBuffer,
  uploadsDir
};
