import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import uploadRouter from './routes/uploadRoutes.js';
import petRouter from './routes/petRoute.js';


// app config 
const app = express();
const port = process.env.PORT || 8500;
connectDB()
connectCloudinary()



//middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use('/api/user',userRouter)
import fs from 'fs';

// Créer le dossier 'uploads' s'il n'existe pas
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/api',uploadRouter)
app.use('/api/pet',petRouter)






app.get('/',(req,res)=>{
    res.send('API working great  ')
})

app.listen(port,()=> console.log("server started",port ))

