import multer from 'multer';
import path from 'path';

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier temporaire pour stocker les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nom unique pour le fichier
  },
});

// Configuration de multer
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille à 5 Mo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true); // Accepter le fichier
    } else {
      cb(new Error('Please upload an image file'), false); // Rejeter le fichier
    }
  },
});

export { upload };