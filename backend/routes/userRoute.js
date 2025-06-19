import express from "express";
import {
  approveUser,
  createProfile,
  deleteUserByAdmin,
  forgotPassword,
  getAllUsers,
  getCurrentUser,
  getTrainerById,
  getTrainerReviews,
  getTrainers,
  getUserStats,
  getVeterinarianById,
  getVeterinarians,
  login,
  register,
  resetPassword,
  submitTrainerReview,
  updateProfile,
  updateTrainerProfile,
  updateUserByAdmin,
  updateVetProfile,
  validateResetToken
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
userRouter.get('/trainers', getTrainers); 
userRouter.get('/trainer/:id', getTrainerById);
userRouter.get("/trainer/:trainerId/reviews", getTrainerReviews);


// Protected Routes
userRouter.get('/me', authenticate, getCurrentUser);
console.log('GET /me route registered');
userRouter.post("/profile", authenticate, createProfile);
userRouter.put("/updateProfile", authenticate, updateProfile); 
userRouter.put("/updateVetProfile", authenticate, updateVetProfile);
userRouter.post("/trainer/:trainerId/reviews", authenticate, submitTrainerReview);
userRouter.put("/updateTrainerProfile", authenticate, updateTrainerProfile);


// Admin-Only Route
userRouter.get('/getAllUsers', authenticate, authorize('Admin'), getAllUsers);
userRouter.put("/users/:userId", authenticate, authorize("Admin"), updateUserByAdmin); // update the role / adminType / isActive / isArchieve
userRouter.delete("/users/:userId", authenticate, authorize("Admin"), deleteUserByAdmin); // update the role / adminType / isActive / isArchieve
userRouter.put("/users/:userId/approve", authenticate, authorize("Admin"), approveUser); // an endpoint for admins to activate accounts
userRouter.get("/stats", authenticate, authorize("Admin"), getUserStats);

export default userRouter; 