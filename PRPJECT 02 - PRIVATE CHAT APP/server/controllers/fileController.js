const { uploadBuffer } = require('../services/uploadService');

// @desc    Upload image, document, voice message, or background
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      });
    }

    const { folder = 'chat_media', type = 'file' } = req.body;
    let resourceType = 'auto';

    if (type === 'voice' || req.file.mimetype.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary treats audio under video resource_type
    } else if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw';
    }

    const result = await uploadBuffer(req.file.buffer, {
      folder: `converse/${folder}`,
      resource_type: resourceType,
      filename: req.file.originalname,
      mimetype: req.file.mimetype
    });

    return res.status(200).json({
      success: true,
      fileUrl: result.url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (err) {
    console.error('File upload controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file. Please check file format and size.'
    });
  }
};

module.exports = {
  uploadFile
};
