import express from 'express';
import fileUpload from 'express-fileupload';
import { uploadImage } from '../controllers/uploadController.js';

const uploadRouter = express.Router();

uploadRouter.post('/upload', fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}), uploadImage);

export default uploadRouter;