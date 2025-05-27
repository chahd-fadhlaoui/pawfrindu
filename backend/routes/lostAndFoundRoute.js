import express from "express";
import {
  approveReport,
  archiveReport,
  createFoundReport,
  createLostReport,
  deleteReport,
  getAllReports,
  getMyReports,
  getPotentialMatches,
  getReportById,
  getReportsByStatus,
  markReunited,
  matchReports,
  unarchiveReport,
  updateReport,
  unmatchReport, 
} from "../controllers/lostAndFoundController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { verifyToken } from "../controllers/userController.js";
import multer from "multer";

const lostAndFoundRouter = express.Router();

const upload = multer(); 

// Create a new found report (authentication optional)
lostAndFoundRouter.post("/", upload.none(), verifyToken, createFoundReport);

// Create a new lost report
lostAndFoundRouter.post("/lost", upload.none(), verifyToken, createLostReport);

// Get all lost and found reports (public)
lostAndFoundRouter.get("/", getAllReports);

// Get a single report by ID (public)
lostAndFoundRouter.get("/:id", getReportById);

// Update a report (authenticated, owner or admin)
lostAndFoundRouter.put("/:id", authenticate, updateReport);

// Delete a report (authenticated, owner or admin)
lostAndFoundRouter.delete("/:id", authenticate, deleteReport);

// Approve a report (authenticated, admin only)
lostAndFoundRouter.put("/:id/approve", authenticate, approveReport);

// Archive a report (authenticated, owner or admin)
lostAndFoundRouter.put("/:id/archive", authenticate, archiveReport);

// Unarchive a report (authenticated, owner or admin)
lostAndFoundRouter.put("/:id/unarchive", authenticate, unarchiveReport);

// Mark report as reunited (authenticated, admin only)
lostAndFoundRouter.put("/:id/reunited", authenticate, markReunited);

// Unmatch a report (authenticated, admin only)
lostAndFoundRouter.put("/:id/unmatch", authenticate, unmatchReport); // New route

// Get reports by status (public)
lostAndFoundRouter.get("/status/:status", getReportsByStatus);

// Get my reports (authenticated)
lostAndFoundRouter.get("/my-reports", authenticate, getMyReports);

// Get potential matches for a report (authenticated, admin only)
lostAndFoundRouter.get("/potential-matches/:id", getPotentialMatches);

// Match reports (authenticated, admin only)
lostAndFoundRouter.post("/match", authenticate, matchReports);

export default lostAndFoundRouter;