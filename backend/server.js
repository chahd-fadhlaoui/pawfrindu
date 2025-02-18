import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import uploadRouter from './routes/uploadRoutes.js';


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
app.use('/api',uploadRouter)





app.get('/',(req,res)=>{
    res.send('API working great  ')
})

app.listen(port,()=> console.log("server started",port ))

