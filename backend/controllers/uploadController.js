import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    console.log('Received file:', file);

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const filePath = path.resolve(file.path);
    console.log('Checking file at:', filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ message: 'File does not exist on server' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'profile-photos',
      width: 500,
      height: 500,
      crop: 'fill',
    });

    console.log('Image uploaded to Cloudinary:', result.secure_url);

    // Delete the local file
    try {
      fs.unlinkSync(filePath);
      console.log('Local file deleted:', filePath);
    } catch (unlinkErr) {
      console.error('Failed to delete local file:', unlinkErr);
    }

    res.status(200).json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error uploading image' });
  }
};