// backend/routes/userRoute.js (or userRouter.js)
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
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

// Public Routes
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get('/validate-reset-token/:token', validateResetToken);

// Protected Routes
userRouter.get('/me', authenticate, getCurrentUser);
console.log('GET /me route registered');
userRouter.post("/profile", authenticate, createProfile);

// Admin-Only Route
userRouter.get('/getAllUsers', authenticate, authorize('Admin'), getAllUsers);

export default userRouter;