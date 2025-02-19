import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { upload } from '../config/multerConfig.js';

const uploadRouter = express.Router();

uploadRouter.post('/upload',upload.single('image'),uploadImage);

export default uploadRouter;