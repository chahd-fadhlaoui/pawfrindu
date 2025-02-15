import express from "express"
import { createProfile, login, register } from "../controllers/userController.js"


const userRouter=express.Router()

userRouter.post('/register',register)
userRouter.post('/login', login);
// Routes protégées (nécessitent un token)
userRouter.post('/profile', createProfile);

export default userRouter 