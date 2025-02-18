import { v2 as cloudinary } from 'cloudinary';

export const uploadImage = async (req, res) => {
  try {
    const file = req.files.image;
    
    // Validate file type
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Validate file size (5mb)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image must be less than 5MB' });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'profile-photos',
      width: 500,
      height: 500,
      crop: 'fill'
    });

    res.status(200).json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
};