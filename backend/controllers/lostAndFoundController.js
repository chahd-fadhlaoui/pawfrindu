
import LostAndFound from "../models/lostAndFoundModel.js";
import User from "../models/userModel.js";
import { io } from "../server.js";
import { sendEmail } from "../services/emailService.js";

// Create a new found report 
export const createFoundReport = async (req, res) => {
  try {
    const {
      type,
      species,
      breed,
      size,
      gender,
      isPregnant,
      colorType,
      color,
      date,
      description,
      location,
      photos,
      microchipNumber,
      email,
      phoneNumber,
      status,
    } = req.body;

    // Validation for required fields
    if (!species) {
      return res.status(400).json({
        success: false,
        message: "Species is required",
      });
    }

    if (!color || !Array.isArray(color) || color.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one color is required",
      });
    }

    if (!location?.governorate) {
      return res.status(400).json({
        success: false,
        message: "Governorate is required",
      });
    }

    if (!location?.delegation) {
      return res.status(400).json({
        success: false,
        message: "Delegation is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one photo is required",
      });
    }

    // Handle authenticated vs unauthenticated users
    let owner = null;
    let finalEmail = email;
    let finalPhoneNumber = phoneNumber;

    if (req.user?._id) {
      // Authenticated user
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      owner = user._id;
      finalEmail = user.email;
      finalPhoneNumber =
        user.petOwnerDetails?.phone ||
        user.trainerDetails?.phone ||
        user.veterinarianDetails?.phone ||
        "";
    } else {
      // Unauthenticated user email and phoneNumber are required
      if (!email || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Email and phone number are required for unauthenticated users",
        });
      }
    }

    // Create new report
    const newReport = new LostAndFound({
      type: type || "Found",
      species,
      breed,
      size,
      gender,
      isPregnant: isPregnant === true || isPregnant === "true",
      colorType: colorType || "Single",
      color,
      date: new Date(date),
      description: description || "",
      location,
      photos,
      microchipNumber,
      status: status || "Pending",
      owner,
      email: finalEmail,
      phoneNumber: finalPhoneNumber,
      isApproved: false,
      isArchived: false,
    });

    // Save report
    const savedReport = await newReport.save();

    // Emit socket event
    io.emit("foundReportCreated", {
      _id: savedReport._id,
      type: savedReport.type,
      species: savedReport.species,
      location: savedReport.location,
      date: savedReport.date,
    });

    return res.status(201).json({
      success: true,
      message: "Found report created successfully",
      data: savedReport,
    });
  } catch (error) {
    console.error("Error creating found report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error creating found report",
      error: error.message,
    });
  }
};

// Get all lost and found reports 
export const getAllReports = async (req, res) => {
  try {
    const reports = await LostAndFound.find()
      .populate("owner", "fullName email")
      .populate("pet", "name species breed");

    // Sanitize data
    const sanitizedReports = reports.map((report) => ({
      ...report._doc,
      species: report.species || "unknown",
      color: report.color || [],
      size: report.size || "unknown",
      location: {
        governorate: report.location?.governorate || "Unknown",
        delegation: report.location?.delegation || "Unknown",
        coordinates: report.location?.coordinates?.coordinates || [0, 0], 
},
        status: report.status || "Pending",
      }));

    return res.status(200).json({
      success: true,
      count: sanitizedReports.length,
      data: sanitizedReports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching lost and found reports",
      error: error.message,
    });
  }
};

// Get a single report by ID 
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await LostAndFound.findById(id)
      .populate("owner", "fullName email")
      .populate("pet", "name species breed");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching report details",
      error: error.message,
    });
  }
};

// Update a report 
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await LostAndFound.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (
      report.owner &&
      report.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own reports",
      });
    }

    // Validate coordinates if provided
    if (updateData.location?.coordinates?.type === "Point" && Array.isArray(updateData.location.coordinates.coordinates)) {
      const [longitude, latitude] = updateData.location.coordinates.coordinates;
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: "Latitude must be between -90 and 90",
        });
      }
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: "Longitude must be between -180 and 180",
        });
      }
    }

    const significantFields = [
      "type",
      "name",
      "species",
      "breed",
      "colorType",
      "color",
      "size",
      "gender",
      "age",
      "date",
      "location",
      "photos",
      "description",
      "microchipNumber",
    ];
    const requiresApproval = significantFields.some(
      (field) =>
        updateData[field] !== undefined &&
        JSON.stringify(updateData[field]) !== JSON.stringify(report[field])
    );

    if (requiresApproval && req.user.role !== "Admin") {
      updateData.isApproved = false;
      updateData.status = "Pending";
    }

    const updatedReport = await LostAndFound.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("owner", "fullName email");

    io.emit("reportUpdated", {
      reportId: id,
      updatedReport,
      message:
        requiresApproval && req.user.role !== "Admin"
          ? "Report updated, pending approval"
          : "Report updated successfully",
    });

    return res.status(200).json({
      success: true,
      message:
        requiresApproval && req.user.role !== "Admin"
          ? "Report updated successfully, pending admin approval"
          : "Report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating report",
      error: error.message,
    });
  }
};
export const updateFoundReport = async (req, res) => {
  const { id } = req.params; // Declare id at function scope
  try {
    // Log incoming request
    console.log(`Received request to update Found report ${id} with payload:`, JSON.stringify(req.body, null, 2));

    // Check if the report exists
    const report = await LostAndFound.findById(id);
    if (!report) {
      console.error(`Report with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if the report is a Found report
    if (report.type !== "Found") {
      console.error(`Report ${id} is not a Found report, type: ${report.type}`);
      return res.status(400).json({
        success: false,
        message: "This endpoint is for updating Found reports only",
      });
    }

    // Authorization check
    if (
      report.owner &&
      report.owner.toString() !== req.user?._id.toString() &&
      req.user?.role !== "Admin"
    ) {
      console.error(`Unauthorized update attempt for report ${id} by user ${req.user?._id}`);
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own reports",
      });
    }

    // Handle photo removal
    const photosToRemove = Array.isArray(req.body.photosToRemove)
      ? req.body.photosToRemove.filter((url) => typeof url === "string")
      : [];
    if (photosToRemove.length > 0) {
      for (const photoUrl of photosToRemove) {
        try {
          const key = extractS3KeyFromUrl(photoUrl);
          await deleteFromS3(key);
          console.log(`Deleted photo from S3: ${photoUrl}`);
        } catch (s3Error) {
          console.error(`Failed to delete photo from S3: ${photoUrl}`, s3Error.message);
        }
      }
      report.photos = report.photos.filter((photo) => !photosToRemove.includes(photo));
    }

    // Prepare update data
    const updateData = {
      type: "Found", // Hardcode to prevent type change
      name: req.body.name || report.name,
      species: req.body.species || report.species,
      breed: req.body.breed || report.breed,
      size: req.body.size || report.size,
      gender: req.body.gender || report.gender,
      age: req.body.age || report.age,
      description: req.body.description || report.description,
      email: req.body.email || report.email,
      phoneNumber: req.body.phoneNumber || report.phoneNumber,
      color: req.body.color
        ? Array.isArray(req.body.color)
          ? req.body.color
          : [req.body.color]
        : report.color,
      date: req.body.date ? new Date(req.body.date) : report.date,
      location: {
        governorate: req.body["location[governorate]"] || report.location.governorate,
        delegation: req.body["location[delegation]"] || report.location.delegation,
        coordinates: req.body["location[coordinates]"]
          ? JSON.parse(req.body["location[coordinates]"])
          : report.location.coordinates || { type: "Point", coordinates: [0, 0] },
      },
      microchipNumber: req.body.microchipNumber || report.microchipNumber,
      isPregnant:
        req.body.isPregnant !== undefined
          ? req.body.isPregnant === "true" || req.body.isPregnant === true
            ? true
            : req.body.isPregnant === "false" || req.body.isPregnant === false
            ? false
            : null
          : report.isPregnant,
      photos: report.photos || [],
    };

    // Handle new photo URLs from request body
    if (req.body.photos) {
      const newPhotos = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
      updateData.photos = [
        ...updateData.photos,
        ...newPhotos.filter((url) => typeof url === "string"),
      ];
    }

    // Validate required fields
    const requiredFields = ["name", "species", "color", "date", "location.governorate", "location.delegation", "gender"];
    for (const field of requiredFields) {
      const fieldValue = field.includes("location.") ? updateData.location[field.split(".")[1]] : updateData[field];
      if (!fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === "")) {
        console.error(`Missing or invalid required field ${field} for report ${id}`);
        return res.status(400).json({
          success: false,
          message: `Missing or invalid required field: ${field}`,
        });
      }
    }

    // Log update data
    console.log(`Updating Found report ${id} with data:`, JSON.stringify(updateData, null, 2));

    // Update the report
    const updatedReport = await LostAndFound.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("owner", "fullName email");

    if (!updatedReport) {
      console.error(`Failed to update report ${id}: Update returned null`);
      return res.status(500).json({
        success: false,
        message: "Failed to update report",
      });
    }

    // Verify database state
    const dbReport = await LostAndFound.findById(id).lean();
    console.log(`Post-update database check for ${id}:`, { type: dbReport.type });

    // Emit socket event
    if (global.io) {
      global.io.emit("reportUpdated", {
        reportId: id,
        updatedReport,
        message: "Found report updated successfully",
      });
      console.log(`Socket event emitted for updated Found report ${id}`);
    } else {
      console.warn("Socket.io instance not available");
    }

    return res.status(200).json({
      success: true,
      message: "Found report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error(`Error updating Found report ${id}:`, {
      params: req.params,
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Error updating Found report",
      error: error.message,
      details: error.errors || {},
    });
  }
};

// Update Lost Report
export const updateLostReport = async (req, res) => {
  const { id } = req.params; // Declare id at function scope
  try {
    // Log incoming request
    console.log(`Received request to update Lost report ${id} with payload:`, JSON.stringify(req.body, null, 2));

    // Check if the report exists and is a Lost report
    const report = await LostAndFound.findById(id);
    if (!report) {
      console.error(`Report with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }
    if (report.type !== "Lost") {
      console.error(`Report ${id} is not a Lost report, type: ${report.type}`);
      return res.status(400).json({
        success: false,
        message: "This endpoint is for updating Lost reports only",
      });
    }

    // Log initial report state
    console.log(`Found Lost report ${id}:`, {
      type: report.type,
      isArchived: report.isArchived,
      status: report.status,
    });

    // Authorization check
    if (
      report.owner &&
      report.owner.toString() !== req.user?._id.toString() &&
      req.user?.role !== "Admin"
    ) {
      console.error(`Unauthorized update attempt for report ${id} by user ${req.user?._id}`);
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own reports",
      });
    }

    // Handle photo removal
    const photosToRemove = Array.isArray(req.body.photosToRemove)
      ? req.body.photosToRemove.filter((url) => typeof url === "string")
      : [];
    if (photosToRemove.length > 0) {
      for (const photoUrl of photosToRemove) {
        try {
          const key = extractS3KeyFromUrl(photoUrl);
          await deleteFromS3(key);
          console.log(`Deleted photo from S3: ${photoUrl}`);
        } catch (s3Error) {
          console.error(`Failed to delete photo from S3: ${photoUrl}`, s3Error.message);
        }
      }
      report.photos = report.photos.filter((photo) => !photosToRemove.includes(photo));
    }

    // Prepare update data
    const updateData = {
      type: "Lost", // Hardcode type to Lost
      name: req.body.name !== undefined ? req.body.name : report.name,
      species: req.body.species || report.species,
      breed: req.body.breed !== undefined ? req.body.breed : report.breed,
      size: req.body.size !== undefined ? req.body.size : report.size,
      gender: req.body.gender !== undefined ? req.body.gender : report.gender,
      age: req.body.age !== undefined ? req.body.age : report.age,
      description: req.body.description !== undefined ? req.body.description : report.description,
      email: req.body.email || report.email || undefined,
      phoneNumber: req.body.phoneNumber || report.phoneNumber || undefined,
      color: req.body.color
        ? Array.isArray(req.body.color)
          ? req.body.color
          : [req.body.color]
        : report.color || [],
      date: req.body.date ? new Date(req.body.date) : report.date,
      location: {
        governorate: req.body["location[governorate]"] || report.location.governorate,
        delegation: req.body["location[delegation]"] || report.location.delegation,
        coordinates: report.location.coordinates || { type: "Point", coordinates: [0, 0] },
      },
      microchipNumber: req.body.microchipNumber !== undefined ? req.body.microchipNumber : report.microchipNumber,
      isPregnant:
        req.body.isPregnant !== undefined
          ? req.body.isPregnant === "true" || req.body.isPregnant === true
            ? true
            : req.body.isPregnant === "false" || req.body.isPregnant === false
            ? false
            : null
          : report.isPregnant,
      photos: report.photos || [],
      status: report.status,
      isArchived: report.isArchived,
    };

    // Ignore req.body.type if sent
    if (req.body.type && req.body.type !== "Lost") {
      console.warn(`Attempt to set invalid type ${req.body.type} for Lost report ${id}, ignoring`);
    }

    // Handle coordinates parsing
    if (req.body["location[coordinates]"]) {
      try {
        const parsedCoordinates = JSON.parse(req.body["location[coordinates]"]);
        if (
          parsedCoordinates &&
          parsedCoordinates.type === "Point" &&
          Array.isArray(parsedCoordinates.coordinates) &&
          parsedCoordinates.coordinates.length === 2
        ) {
          updateData.location.coordinates = parsedCoordinates;
        } else {
          console.warn(`Invalid coordinates format for report ${id}, using existing coordinates`);
        }
      } catch (parseError) {
        console.error(`Error parsing coordinates for report ${id}:`, parseError.message);
      }
    }

    // Validate required fields
    const requiredFields = ["name", "species", "color", "date", "location.governorate", "location.delegation", "gender"];
    for (const field of requiredFields) {
      const fieldValue = field.includes("location.") ? updateData.location[field.split(".")[1]] : updateData[field];
      if (!fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === "")) {
        console.error(`Missing or invalid required field ${field} for report ${id}`);
        return res.status(400).json({
          success: false,
          message: `Missing or invalid required field: ${field}`,
        });
      }
    }

    // Ensure color is an array and not empty
    if (!Array.isArray(updateData.color) || updateData.color.length === 0) {
      console.error(`Color field is empty or invalid for report ${id}`);
      return res.status(400).json({
        success: false,
        message: "At least one color is required",
      });
    }

    // Validate date
    if (isNaN(new Date(updateData.date).getTime())) {
      console.error(`Invalid date for report ${id}: ${updateData.date}`);
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Log update data
    console.log(`Updating Lost report ${id} with data:`, JSON.stringify(updateData, null, 2));

    // Update the report
    const updatedReport = await LostAndFound.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("owner", "fullName email");

    if (!updatedReport) {
      console.error(`Failed to update report ${id}: Update returned null`);
      return res.status(500).json({
        success: false,
        message: "Failed to update report",
      });
    }

    // Log updated report
    console.log(`Successfully updated Lost report ${id} with fields:`, JSON.stringify(updatedReport, null, 2));

    // Verify database state
    const dbReport = await LostAndFound.findById(id).lean();
    console.log(`Post-update database check for ${id}:`, { type: dbReport.type });

    if (dbReport.type !== "Lost") {
      console.error(`Type mismatch after update for ${id}: expected Lost, got ${dbReport.type}`);
      return res.status(500).json({
        success: false,
        message: "Type mismatch after update",
      });
    }

    // Log updated report state
    console.log(`Updated Lost report ${id}:`, {
      type: updatedReport.type,
      isArchived: updatedReport.isArchived,
      status: updatedReport.status,
    });

    // Emit socket event
    if (global.io) {
      global.io.emit("reportUpdated", {
        reportId: id,
        updatedReport,
        message: "Lost report updated successfully",
      });
      console.log(`Socket event emitted for updated Lost report ${id}`);
    } else {
      console.warn("Socket.io instance not available");
    }

    return res.status(200).json({
      success: true,
      message: "Lost report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error(`Error updating Lost report ${id}:`, {
      params: req.params,
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Error updating Lost report",
      error: error.message,
      details: error.errors || {},
    });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await LostAndFound.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if user is the owner or admin
    if (
      report.owner &&
      report.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own reports",
      });
    }

    await LostAndFound.findByIdAndDelete(id);

    io.emit("reportDeleted", {
      reportId: id,
      message: "Report deleted successfully",
    });

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error deleting report",
      error: error.message,
    });
  }
};

// Approve a report (Admin action)
export const approveReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can approve reports",
      });
    }

    const report = await LostAndFound.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.isApproved = true;
    report.status = "Pending";
    await report.save();

    // Emit Socket.IO event
    io.emit("reportApproved", {
      reportId: id,
      updatedReport: report,
      message: "Report approved by admin",
    });

    return res.status(200).json({
      success: true,
      message: "Report approved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error approving report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error approving report",
      error: error.message,
    });
  }
};

// Archive a report 
export const archiveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await LostAndFound.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (
      report.owner &&
      report.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only archive your own reports",
      });
    }

    if (report.isArchived) {
      return res.status(400).json({
        success: false,
        message: "Report is already archived",
      });
    }

    report.isArchived = true;
    await report.save();

    // Emit Socket.IO event
    io.emit("reportArchived", {
      reportId: id,
      message: "Report archived successfully",
    });

    return res.status(200).json({
      success: true,
      message: "Report archived successfully",
    });
  } catch (error) {
    console.error("Error archiving report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error archiving report",
      error: error.message,
    });
  }
};

// Unarchive a report 
export const unarchiveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await LostAndFound.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (
      report.owner &&
      report.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only unarchive your own reports",
      });
    }

    if (!report.isArchived) {
      return res.status(400).json({
        success: false,
        message: "Report is not archived",
      });
    }

    report.isArchived = false;
    await report.save();

    io.emit("reportUnarchived", {
      reportId: id,
      message: "Report unarchived successfully",
    });

    return res.status(200).json({
      success: true,
      message: "Report unarchived successfully",
    });
  } catch (error) {
    console.error("Error unarchiving report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error unarchiving report",
      error: error.message,
    });
  }
};

// Get reports by status 
export const getReportsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["Pending", "Matched", "Reunited"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: Pending, Matched, Reunited",
      });
    }

    const reports = await LostAndFound.find({ status })
      .populate("owner", "fullName email")
      .populate("pet", "name species breed");

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports by status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching reports by status",
      error: error.message,
    });
  }
};

// Get my reports
export const getMyReports = async (req, res) => {
  try {
    const ownerId = req.user._id;
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }
    const reports = await LostAndFound.find({ owner: ownerId }).populate(
      "pet",
      "name species breed", 
      null,
      { strictPopulate: false }
    );
    return res.status(200).json({
      success: true,
      count: reports.length,
      reports, // Changed from data to reports
    });
  } catch (error) {
    console.error("Error fetching my reports:", error.stack); // Log full stack
    return res.status(500).json({
      success: false,
      message: "Error fetching your reports",
      error: error.message,
    });
  }
};

// Match a lost and found report
export const matchReports = async (req, res) => {
  try {
    const { reportId, matchedReportId } = req.body;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can match reports",
      });
    }

    const report = await LostAndFound.findById(reportId).populate("owner");
    const matchedReport = await LostAndFound.findById(matchedReportId).populate("owner");

    if (!report || !matchedReport) {
      return res.status(404).json({
        success: false,
        message: "One or both reports not found",
      });
    }

    if (report.status !== "Pending" || matchedReport.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Both reports must be in Pending status",
      });
    }

    if (report.type === matchedReport.type) {
      return res.status(400).json({
        success: false,
        message: "Cannot match reports of the same type",
      });
    }

    // Update both reports
    report.status = "Matched";
    report.matchedReport = matchedReportId;
    matchedReport.status = "Matched";
    matchedReport.matchedReport = reportId;

    await report.save();
    await matchedReport.save();

    // Send email notifications
    // For the first report
    if (report.owner || report.email) {
      try {
        const emailData = {
          fullName: report.owner?.fullName || "User",
          reportType: report.type,
          petName: report.name || null,
          matchedUserFullName: matchedReport.owner?.fullName || "Anonymous User",
          matchedUserEmail: matchedReport.owner?.email || matchedReport.email,
          matchedUserPhone: matchedReport.owner
            ? (matchedReport.owner.petOwnerDetails?.phone ||
               matchedReport.owner.trainerDetails?.phone ||
               matchedReport.owner.veterinarianDetails?.phone ||
               matchedReport.phoneNumber ||
               "Not provided")
            : (matchedReport.phoneNumber || "Not provided"),
        };
        await sendEmail({
          to: report.owner?.email || report.email,
          template: "reportMatched",
          data: emailData,
        });
      } catch (emailError) {
        console.error("Failed to send report matched email for report:", reportId, emailError.message);
      }
    }

    // For the matched report
    if (matchedReport.owner || matchedReport.email) {
      try {
        const emailData = {
          fullName: matchedReport.owner?.fullName || "User",
          reportType: matchedReport.type,
          petName: matchedReport.name || null,
          matchedUserFullName: report.owner?.fullName || "Anonymous User",
          matchedUserEmail: report.owner?.email || report.email,
          matchedUserPhone: report.owner
            ? (report.owner.petOwnerDetails?.phone ||
               report.owner.trainerDetails?.phone ||
               report.owner.veterinarianDetails?.phone ||
               report.phoneNumber ||
               "Not provided")
            : (report.phoneNumber || "Not provided"),
        };
        await sendEmail({
          to: matchedReport.owner?.email || matchedReport.email,
          template: "reportMatched",
          data: emailData,
        });
      } catch (emailError) {
        console.error("Failed to send report matched email for matched report:", matchedReportId, emailError.message);
      }
    }

    io.emit("reportMatched", {
      reportId,
      matchedReportId,
      message: "Reports matched successfully",
    });

    return res.status(200).json({
      success: true,
      message: "Reports matched successfully",
      data: { report, matchedReport },
    });
  } catch (error) {
    console.error("Error matching reports:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error matching reports",
      error: error.message,
    });
  }
};

// Mark reports as reunited
export const markReunited = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can mark reports as reunited",
      });
    }

    const report = await LostAndFound.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status !== "Matched") {
      return res.status(400).json({
        success: false,
        message: "Report must be in Matched status to mark as Reunited",
      });
    }

    report.status = "Reunited";
    if (report.matchedReport) {
      const matchedReport = await LostAndFound.findById(report.matchedReport);
      if (matchedReport) {
        matchedReport.status = "Reunited";
        await matchedReport.save();
      }
    }

    await report.save();

    io.emit("reportReunited", {
      reportId: id,
      message: "Report marked as reunited",
    });

    return res.status(200).json({
      success: true,
      message: "Report marked as reunited successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error marking report as reunited:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error marking report as reunited",
      error: error.message,
    });
  }
};

// Create a lost report
export const createLostReport = async (req, res) => {
  try {
    const {
      name,
      species,
      gender,
      isPregnant,
      color,
      colorType,
      breed,
      size,
      location,
      date,
      email,
      phoneNumber,
      description,
      microchipNumber,
      photos,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !species ||
      !gender ||
      !color ||
      !color.length ||
      !location?.governorate ||
      !location?.delegation ||
      !date ||
      !email ||
      !phoneNumber ||
      !photos ||
      !photos.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate date
    const reportDate = new Date(date);
    if (isNaN(reportDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Validate photos
    if (!Array.isArray(photos) || photos.some((url) => typeof url !== "string")) {
      return res.status(400).json({
        success: false,
        message: "Photos must be an array of valid URLs",
      });
    }

    // Validate and format coordinates
    let coordinates = undefined;
    if (location?.coordinates?.type === "Point" && Array.isArray(location.coordinates.coordinates)) {
      const [longitude, latitude] = location.coordinates.coordinates;
      if (
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        coordinates = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid GeoJSON coordinates",
        });
      }
    }

    // Create report
    const report = new LostAndFound({
      type: "Lost",
      name,
      species,
      gender,
      isPregnant:
        gender === "Female" && isPregnant !== undefined ? isPregnant : undefined,
      color,
      colorType,
      breed,
      size,
      location: {
        governorate: location.governorate,
        delegation: location.delegation,
        coordinates, // Save GeoJSON format
      },
      date: reportDate,
      email,
      phoneNumber,
      description,
      microchipNumber,
      photos,
      owner: req.user?._id || null,
      status: "Pending",
      isApproved: false,
      isArchived: false,
    });

    await report.save();

    io.emit("lostReportCreated", report);

    return res.status(201).json({
      success: true,
      message: "Lost report created successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error creating lost report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error creating lost report",
      error: error.message,
    });
  }
};
// Unmatch a report
export const unmatchReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can unmatch reports",
      });
    }

    const report = await LostAndFound.findById(id).populate("owner");
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status !== "Matched" || !report.matchedReport) {
      return res.status(400).json({
        success: false,
        message: "Report is not matched",
      });
    }

    const matchedReportId = report.matchedReport;
    const matchedReport = await LostAndFound.findById(matchedReportId).populate("owner");

    // Update both reports
    report.status = "Pending";
    report.matchedReport = null;
    await report.save();

    if (matchedReport) {
      matchedReport.status = "Pending";
      matchedReport.matchedReport = null;
      await matchedReport.save();

      // Send email to the matched report's reporter
      if (matchedReport.owner || matchedReport.email) {
        try {
          const emailData = {
            fullName: matchedReport.owner?.fullName || "User",
            reportType: matchedReport.type,
            petName: matchedReport.name || null,
          };
          await sendEmail({
            to: matchedReport.owner?.email || matchedReport.email,
            template: "reportUnmatched",
            data: emailData,
          });
        } catch (emailError) {
          console.error("Failed to send report unmatched email for matched report:", matchedReportId, emailError.message);
        }
      }
    }

    // Send email to the first report's reporter
    if (report.owner || report.email) {
      try {
        const emailData = {
          fullName: report.owner?.fullName || "User",
          reportType: report.type,
          petName: report.name || null,
        };
        await sendEmail({
          to: report.owner?.email || report.email,
          template: "reportUnmatched",
          data: emailData,
        });
      } catch (emailError) {
        console.error("Failed to send report unmatched email for report:", id, emailError.message);
      }
    }

    io.emit("reportUnmatched", {
      reportId: id,
      matchedReportId,
      message: "Reports unmatched successfully",
    });

    return res.status(200).json({
      success: true,
      message: "Reports unmatched successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error unmatching report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error unmatching report",
      error: error.message,
    });
  }
};

// Calculate Haversine distance between two coordinates (explain : someone in nasa told that if the distance is more then 20km we have to use haversine because otherwise we will get wrong results, i found it in this discussion: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula and here if u really want to read what the nasa guy said: https://cs.nyu.edu/~visual/home/proj/tiger/gisfaq.html)
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => x * Math.PI / 180;
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get potential matches for a report
export const getPotentialMatches = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Searching for report with ID: ${id}`);
    const report = await LostAndFound.findById(id).lean();
    if (!report) {
      console.error(`Report not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    console.log("Report Details:", {
      species: report.species,
      breed: report.breed,
      size: report.size,
      gender: report.gender,
      isPregnant: report.isPregnant,
      microchip: report.microchipNumber,
      location: report.location,
      date: report.date,
      color: report.color,
    });

    const oppositeType = report.type === "Lost" ? "Found" : "Lost";

    const daysSinceReport = Math.min(
      Math.abs((new Date() - new Date(report.date)) / (1000 * 60 * 60 * 24)),
      14
    );
    const maxDistance = Math.max(
      report.species.toLowerCase() === "dog" ? 7230 * daysSinceReport : 500 * daysSinceReport,
      report.species.toLowerCase() === "dog" ? 5000 : 1000
    );

    let potentialMatches = [];

    if (report.microchipNumber) {
      const microchipMatches = await LostAndFound.find({
        type: oppositeType,
        microchipNumber: report.microchipNumber,
        status: "Pending",
        isApproved: true,
        isArchived: false,
      })
        .populate("owner", "fullName email", null, { strictPopulate: false })
        .lean()
        .limit(5);
      console.log("Microchip Matches:", microchipMatches.length);
      potentialMatches = microchipMatches.map((match) => ({
        ...match,
        matchScore: 0.95,
      }));
    }

    const baseQuery = {
      type: oppositeType,
      species: report.species.toLowerCase(),
      status: "Pending",
      isApproved: true,
      isArchived: false,
    };

    const hasValidCoordinates =
      report.location?.coordinates?.type === "Point" &&
      Array.isArray(report.location.coordinates?.coordinates) &&
      report.location.coordinates.coordinates.length === 2 &&
      report.location.coordinates.coordinates[0] >= -180 &&
      report.location.coordinates.coordinates[0] <= 180 &&
      report.location.coordinates.coordinates[1] >= -90 &&
      report.location.coordinates.coordinates[1] <= 90;

    console.log("Has Valid Coordinates:", hasValidCoordinates);

    if (hasValidCoordinates) {
      const geoJSONCount = await LostAndFound.countDocuments({ "location.coordinates.type": "Point" });
      const totalCount = await LostAndFound.countDocuments({ "location.coordinates": { $exists: true } });
      console.log(`GeoJSON documents: ${geoJSONCount}/${totalCount}`);
      if (geoJSONCount === 0 && totalCount > 0) {
        console.warn("No GeoJSON documents found. Geospatial queries may fail.");
      }

      baseQuery["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: report.location.coordinates.coordinates,
          },
          $maxDistance: maxDistance,
        },
      };
    }

    const optionalConditions = [];
    if (report.type === "Lost" && report.breed) {
      optionalConditions.push({
        $or: [
          { breed: { $regex: `^${report.breed}$`, $options: "i" } },
          { breed: { $exists: false } },
          { breed: null },
        ],
      });
    }
    if (report.size) {
      optionalConditions.push({
        $or: [
          { size: { $regex: `^${report.size}$`, $options: "i" } },
          { size: { $exists: false } },
          { size: null },
        ],
      });
    }
    if (report.gender) {
      optionalConditions.push({
        $or: [
          { gender: { $regex: `^${report.gender}$`, $options: "i" } },
          { gender: { $exists: false } },
          { gender: null },
        ],
      });
    }
    if (optionalConditions.length > 0) baseQuery.$and = optionalConditions;

    const dateRangeDays = 14;
    const baseDate = new Date(report.date);
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() - dateRangeDays);
    const endDate = new Date(baseDate);
    endDate.setDate(baseDate.getDate() + dateRangeDays);
    baseQuery.date = { $gte: startDate, $lte: endDate };

    console.log("Query:", JSON.stringify(baseQuery, null, 2));

    const indexes = await LostAndFound.collection.getIndexes();
    console.log("Collection Indexes:", JSON.stringify(indexes, null, 2));

    let attributeMatches = await LostAndFound.find(baseQuery)
      .populate("owner", "fullName email", null, { strictPopulate: false })
      .lean()
      .limit(10);
    console.log("Attribute Matches:", attributeMatches.length);

    if (attributeMatches.length === 0 && hasValidCoordinates) {
      delete baseQuery["location.coordinates"];
      attributeMatches = await LostAndFound.find(baseQuery)
        .populate("owner", "fullName email", null, { strictPopulate: false })
        .lean()
        .limit(20);
      console.log("Fallback Attribute Matches:", attributeMatches.length);
    }

    attributeMatches.forEach((match) => {
      const distance =
        hasValidCoordinates && match.location?.coordinates?.type === "Point"
          ? haversineDistance(
              report.location.coordinates.coordinates,
              match.location.coordinates.coordinates
            )
          : null;
      console.log("Match Details:", {
        id: match._id,
        breed: match.breed,
        size: match.size,
        gender: match.gender,
        isPregnant: match.isPregnant,
        coordinates: match.location?.coordinates,
        color: match.color,
        distance: distance != null ? `${distance.toFixed(1)} km` : "N/A",
      });
    });

    const matchIds = new Set(potentialMatches.map((m) => m._id.toString()));
    potentialMatches = [
      ...potentialMatches,
      ...attributeMatches.filter((m) => !matchIds.has(m._id.toString())),
    ];

    const scoredMatches = potentialMatches
      .map((match) => {
        let score = match.matchScore || 0;
        if (match.microchipNumber && match.microchipNumber === report.microchipNumber) {
          score = 0.95;
        } else {
          const hasCommonColor =
            match.color?.length &&
            report.color?.length &&
            match.color.some((c) => report.color.includes(c));
          if (hasCommonColor) {
            console.log(`Color match for ${match._id}: ${match.color}, score += 0.15`);
            score += 0.15;
          }
          if (
            report.type === "Lost" &&
            report.breed &&
            match.breed?.toLowerCase() === report.breed.toLowerCase()
          ) {
            console.log(`Breed match for ${match._id}: ${match.breed}, score += 0.15`);
            score += 0.15;
          }
          if (match.gender?.toLowerCase() === report.gender?.toLowerCase()) {
            console.log(`Gender match for ${match._id}: ${match.gender}, score += 0.10`);
            score += 0.10;
          }
          if (match.size?.toLowerCase() === report.size?.toLowerCase()) {
            console.log(`Size match for ${match._id}: ${match.size}, score += 0.10`);
            score += 0.10;
          }
          if (report.gender === "Female" && match.gender === "Female") {
            if (report.isPregnant === true && match.isPregnant === true) {
              console.log(`Pregnancy match for ${match._id}, score += 0.05`);
              score += 0.05;
            } else if (report.isPregnant === true && match.isPregnant == null) {
              console.log(`Partial pregnancy match for ${match._id} (null), score += 0.025`);
              score += 0.025;
            }
          }
          const dateDiff = Math.abs(new Date(match.date) - new Date(report.date)) / (1000 * 60 * 60 * 24);
          score -= dateDiff * 0.005;
          score += (match.photoScore || 0) * 0.25;
          if (
            match.location?.governorate &&
            report.location?.governorate &&
            match.location.governorate === report.location.governorate
          ) {
            console.log(`Governorate match for ${match._id}: ${match.location.governorate}, score += 0.05`);
            score += 0.05;
            if (
              match.location?.delegation &&
              report.location?.delegation &&
              match.location.delegation === report.location.delegation
            ) {
              console.log(`Delegation match for ${match._id}: ${match.location.delegation}, score += 0.10`);
              score += 0.10;
            }
          }
        }
        return { ...match, matchScore: Math.max(0, Math.min(score, 1)) };
      })
      .filter((match) => match.matchScore >= 0.20);

    console.log(
      "Scored Matches:",
      scoredMatches.map((m) => ({
        id: m._id.toString(),
        matchScore: m.matchScore,
        photoScore: m.photoScore,
      }))
    );

    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
    const finalMatches = scoredMatches.slice(0, 10);

    console.log(
      "Final Matches:",
      finalMatches.map((m) => ({
        id: m._id.toString(),
        matchScore: m.matchScore,
        photoScore: m.photoScore,
      }))
    );

    return res.status(200).json({
      success: true,
      count: finalMatches.length,
      data: finalMatches,
    });
  } catch (error) {
    console.error("Error fetching potential matches:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching potential matches",
      error: error.message,
    });
  }
};