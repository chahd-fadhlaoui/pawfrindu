import express from "express";
import {
  approveUser,
  createProfile,
  deleteUserByAdmin,
  forgotPassword,
  getAllUsers,
  getCurrentUser,
  getUserStats,
  getVeterinarianById,
  getVeterinarians,
  login,
  register,
  resetPassword,
  updateProfile,
  updateUserByAdmin,
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
userRouter.get('/veterinarians', getVeterinarians); 
userRouter.get('/vet/:id', getVeterinarianById);



// Protected Routes
userRouter.get('/me', authenticate, getCurrentUser);
console.log('GET /me route registered');
userRouter.post("/profile", authenticate, createProfile);
userRouter.put("/updateProfile", authenticate, updateProfile); // Nouvelle route PUT pour update
// Admin-Only Route
userRouter.get('/getAllUsers', authenticate, authorize('Admin'), getAllUsers);
userRouter.put("/users/:userId", authenticate, authorize("Admin"), updateUserByAdmin); // update the role / adminType / isActive / isArchieve
userRouter.put("/users/:userId/approve", authenticate, authorize("Admin"), approveUser); // an endpoint for admins to activate accounts
userRouter.delete("/users/:userId", authenticate, authorize("Admin"), deleteUserByAdmin); // an endpoint for admins to delete accounts
userRouter.get("/stats", authenticate, authorize("Admin"), getUserStats);

export default userRouter;