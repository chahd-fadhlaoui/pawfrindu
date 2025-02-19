import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
 
export const uploadImage = async (req, res) => {
  try {
    const file = req.file; 

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log("📂 Fichier reçu:", file); // Vérifie le chemin du fichier

    if (!fs.existsSync(file.path)) {
      return res.status(500).json({ message: '⚠️ Le fichier n\'existe pas sur le serveur' });
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'profile-photos',
      width: 500,
      height: 500,
      crop: 'fill',
    });

    console.log("✅ Image uploadée avec succès:", result.secure_url);

    // Supprimer le fichier local après upload
    fs.unlinkSync(file.path);

    res.status(200).json({ success: true, url: result.secure_url });
    console.log("📤 Réponse envoyée au frontend:", { success: true, url: result.secure_url });

  } catch (error) {
    console.error('❌ Erreur d\'upload:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de l\'upload' });
  }
};
