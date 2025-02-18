import express from "express";
import {
  createProfile,
  getCurrentUser,
  login,
  register,
  verifyToken,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
// Routes protégées (nécessitent un token)
userRouter.post("/profile", verifyToken, createProfile);
userRouter.get('/me', verifyToken, getCurrentUser);

export default userRouter;
