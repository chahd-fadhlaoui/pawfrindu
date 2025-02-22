import express from "express";
import {
  createProfile,
  forgotPassword,
  getAllUsers,
  getCurrentUser,
  login,
  register,
  resetPassword,
  validateResetToken,
  verifyToken,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get('/validate-reset-token/:token', validateResetToken);
userRouter.get('/getAllUsers', getAllUsers);

// Routes protégées (nécessitent un token)
userRouter.post("/profile", verifyToken, createProfile);
userRouter.get('/me', verifyToken, getCurrentUser);


export default userRouter;
