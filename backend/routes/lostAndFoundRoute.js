import express from "express";
import multer from "multer";
import {
  approveReport,
  archiveReport,
  createFoundReport,
  createLostReport,
  deleteReport,
  getAllReports,
  getLostAndFoundStats,
  getMyReports,
  getPotentialMatches,
  getReportById,
  getReportsByStatus,
  markReunited,
  matchReports,
  unarchiveReport,
  unmatchReport,
  updateFoundReport,
  updateLostReport,
  updateReport,
} from "../controllers/lostAndFoundController.js";
import { verifyToken } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const lostAndFoundRouter = express.Router();

const upload = multer();

lostAndFoundRouter.put(
  "/:id/update-lost",
  (req, res, next) => {
    console.log(`Hit /:id/update-lost for ID: ${req.params.id}, Payload:`, JSON.stringify(req.body, null, 2));
    next();
  },
  authenticate,
  updateLostReport
);

// Update found report
lostAndFoundRouter.put(
  "/:id/update-found",
  (req, res, next) => {
    console.log(`Hit /:id/update-found for ID: ${req.params.id}, Payload:`, JSON.stringify(req.body, null, 2));
    next();
  },
  authenticate,
  updateFoundReport
);

// Create a new found report (authentication optional)
lostAndFoundRouter.post("/", upload.none(), verifyToken, createFoundReport);

// Create a new lost report
lostAndFoundRouter.post("/lost", upload.none(), verifyToken, createLostReport);

// Get all lost and found reports (public)
lostAndFoundRouter.get("/", getAllReports);

// Get my reports (authenticated)
lostAndFoundRouter.get("/my-reports", authenticate, getMyReports);

// Get a single report by ID (public)
lostAndFoundRouter.get("/:id", getReportById);

// Update a report (authenticated, owner or admin)
lostAndFoundRouter.put("/:id", authenticate, upload.none(), updateReport); 


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
lostAndFoundRouter.put("/:id/unmatch", authenticate, unmatchReport);

// Get reports by status (public)
lostAndFoundRouter.get("/status/:status", getReportsByStatus);



// Get potential matches for a report (authenticated, admin only)
lostAndFoundRouter.get("/potential-matches/:id", getPotentialMatches);

// Match reports (authenticated, admin only)
lostAndFoundRouter.post("/match", authenticate, matchReports);

// route for the stats
lostAndFoundRouter.get("/stats" , getLostAndFoundStats);

export default lostAndFoundRouter;