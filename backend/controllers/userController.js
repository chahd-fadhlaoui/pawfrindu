import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { sendEmail } from "../services/emailService.js";
import { io } from "../server.js"; // Import io from the server file
import mongoose from "mongoose";

// 🚀 Étape 1: Enregistrement de l'utilisateur sans détails spécifiques
const register = async (req, res) => {
  console.log("Received registration request with body:", req.body);
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    console.log("Missing fields:", {
      hasFullName: !!fullName,
      hasEmail: !!email,
      hasPassword: !!password,
      hasRole: !!role,
    });
    return res.status(400).json({ message: "All fields are required." });
  }

  

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new Error("User not saved properly.");
    }

    const accessToken = jwt.sign(
      {
        userId: savedUser._id,
        role: savedUser.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    try {
      await sendEmail({
        to: savedUser.email,
        template: "welcome",
        data: savedUser.fullName,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // Emit Socket.IO event for new user registration
    io.emit("userRegistered", {
      userId: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      role: savedUser.role,
      message: "A new user has registered",
    });

    res.status(201).json({
      message: "Account created. Please complete your profile.",
      accessToken,
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.stack);
    res
      .status(500)
      .json({ message: "Failed to create account", detail: error.message });
  }
};  

// 🚀 Étape 2: Complétion du profil et génération du token
const createProfile = async (req, res) => {
  const {
    userId,
    image,
    gender,
    about,
    petOwnerDetails,
    trainerDetails,
    veterinarianDetails,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user's image if provided
    if (image) {
      user.image = image;
    }
    // Update gender if provided
    if (gender) {
      user.gender = gender;
    }
    // Update about if provided
    if (about) {
      user.about = about;
    }

    // Role-specific logic
    if (user.role === "PetOwner") {
      if (!petOwnerDetails?.address || !petOwnerDetails?.phone) {
        return res
          .status(400)
          .json({ message: "Address and phone are required for Pet Owner." });
      }
      user.petOwnerDetails = petOwnerDetails;
    } else if (user.role === "Trainer") {
      if (
        !trainerDetails?.certificationImage ||
        !trainerDetails?.trainingFacilityType ||
        !trainerDetails?.phone
      ) {
        return res.status(400).json({
          message:
            "certification image, training facility type and phone are required for Trainer.",
        });
      }
      // Ensure geolocation is provided for fixed-location facility types
      if (
        trainerDetails.trainingFacilityType === "Fixed Facility" &&
        (!trainerDetails.geolocation?.latitude ||
          !trainerDetails.geolocation?.longitude)
      ) {
        return res.status(400).json({
          message:
            "Geolocation (latitude and longitude) is required for Fixed Facility trainers.",
        });
      }
      user.trainerDetails = {
        ...trainerDetails,
        reviews: trainerDetails.reviews || [],
        rating: trainerDetails.rating || 0,
      };
    } else if (user.role === "Vet") {
      if (
        !veterinarianDetails?.governorate ||  
        !veterinarianDetails?.diplomasAndTraining ||
        !veterinarianDetails?.professionalCardImage ||
        !veterinarianDetails?.phone
      ) {
        return res.status(400).json({
          message:
            "Governorate and diplomas/training details and phone are required for Veterinarian.",
        });
      }
      user.veterinarianDetails = veterinarianDetails;
    }

    // Save all changes
    await user.save();

    // Generate token after profile completion
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    // Emit Socket.IO event for profile completion
    io.emit("userProfileCompleted", {
      userId: user._id,
      role: user.role,
      fullName: user.fullName,
      image: user.image,
      gender: user.gender,
      about: user.about,
      petOwnerDetails: user.petOwnerDetails,
      trainerDetails: user.trainerDetails,
      veterinarianDetails: user.veterinarianDetails,
      message: "User profile completed",
    });

    res.json({
      message: "Profile completed successfully!",
      accessToken,
      user,
    });
  } catch (error) {
    console.error("Profile Completion Error:", error);
    res.status(500).json({ message: "Failed to complete profile." });
  }
};
 
// 🚀 Étape 3: Connexion après enregistrement et complétion du profil
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing email or password:", { email, password });
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    console.log("Attempting to find user with email:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "User not found" });
    }
    console.log("User found:", user._id);

    if (!user.password) {
      console.error("User has no password in DB:", user._id);
      return res
        .status(500)
        .json({ message: "User password is missing in database" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for user:", user._id);
      return res.status(400).json({ message: "Invalid password" });
    }
    console.log("Password validated for user:", user._id);

    let redirectTo = "";
    let shouldUpdateLastLogin = false; // Default to false

    // Log initial state
    console.log(
      "Initial state - isActive:",
      user.isActive,
      "lastLogin:",
      user.lastLogin
    );

    // Vet-specific logic
    if (user.role === "Vet" || user.role === "Trainer") {
      if (!user.isActive && !user.lastLogin) {
      console.log("Case 1: Inactive, first login detected");
      redirectTo = user.role === "Vet" ? "/vet-pending-approval" : "/trainer-pending-approval";
      shouldUpdateLastLogin = false; // Don’t store lastLogin
      } else if (user.isActive) {
      console.log("Case 2/3: Active user detected");
      redirectTo = user.role === "Vet" ? "/vet" : "/trainer";
      shouldUpdateLastLogin = true; // Store or update lastLogin
      } else if (!user.isActive && user.lastLogin) {
      console.log("Case 4: Inactive, previously logged in (deactivated)");
      redirectTo = user.role === "Vet" ? "/vet" : "/trainer";
      shouldUpdateLastLogin = false; // Don’t update lastLogin
      }
    } else {
      console.log("Non-vet/trainer user detected");
      redirectTo =
      user.role === "PetOwner"
        ? "/"
        : user.role === "Admin" || user.role === "SuperAdmin"
        ? "/admin"
        : "/login";
      shouldUpdateLastLogin = true;
    }

    // Log decision
    console.log(
      "Decision - redirectTo:",
      redirectTo,
      "shouldUpdateLastLogin:",
      shouldUpdateLastLogin
    );

    // Update lastLogin if applicable
    if (shouldUpdateLastLogin) {
      user.lastLogin = new Date();
      console.log("Updating lastLogin to:", user.lastLogin);
      await user.save({ validateBeforeSave: false });
      console.log("User saved successfully with lastLogin:", user.lastLogin);
    } else {
      console.log("Skipping lastLogin update for user:", user._id);
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        isActive: user.isActive,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    res.json({
      message: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        petOwnerDetails: user.petOwnerDetails || undefined,
        trainerDetails: user.trainerDetails || undefined,
        veterinarianDetails: user.veterinarianDetails || undefined,
      },
      accessToken,
      redirectTo,
    });
    console.log("Login successful for user:", user._id);
  } catch (error) {
    console.error("Login Error:", error.stack);
    res.status(500).json({ message: "Login failed", detail: error.message });
  }
};

// 🚀 Get current user profile
const getCurrentUser = async (req, res) => {
  console.log("Handling GET /api/user/me for user:", req.user._id);
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      console.log("User not found for ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user._id);

    let shouldUpdateLastLogin = false;

    // Vet-specific logic (mirrors login function)
    if (user.role === "Vet" || user.role === "Trainer") {
      if (!user.isActive && !user.lastLogin) {
        console.log(
          "Case 1: Inactive Professional, first fetch - skipping lastLogin update"
        );
        shouldUpdateLastLogin = false;
      } else if (user.isActive) {
        console.log("Case 2/3: Active Professional - updating lastLogin");
        shouldUpdateLastLogin = true;
      } else if (!user.isActive && user.lastLogin) {
        console.log(
          "Case 4: Inactive Professional, previously logged in - skipping lastLogin update"
        );
        shouldUpdateLastLogin = false;
      }
    } else {
      console.log("Non-Professional user - updating lastLogin");
      shouldUpdateLastLogin = true;
    }

    if (shouldUpdateLastLogin) {
      user.lastLogin = new Date();
      console.log("Updating lastLogin to:", user.lastLogin);
      await user.save({ validateBeforeSave: false });
      console.log("User saved with lastLogin:", user.lastLogin);
    } else {
      console.log("Skipping lastLogin update for user:", user._id);
    }

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        about: user.about,
        image: user.image,
        lastLogin: user.lastLogin,
        petOwnerDetails: user.petOwnerDetails || undefined,
        trainerDetails: user.trainerDetails || undefined,
        veterinarianDetails: user.veterinarianDetails || undefined,
        isArchieve: user.isArchieve,
      },
    });
    console.log("Profile fetched successfully for user:", user._id);
  } catch (error) {
    console.error("Get Current User Error:", error.stack);
    res.status(500).json({
      message: "Failed to fetch user profile",
      detail: error.message,
    });
  }
};

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid Bearer token provided");
      req.user = null; // Proceed as unauthenticated
      return next();
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); // Debug log

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token:", decoded); // Debug log

    req.user = { _id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    req.user = null; // Proceed as unauthenticated
    next();
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Received forgot password request for:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Add resetPasswordToken and resetPasswordExpiry to your user model if not already present
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();
    console.log("Reset token:", resetToken);

    await sendEmail({
      to: email,
      template: "passwordReset",
      data: {
        fullName: user.fullName,
        resetToken: resetToken,
      },
    });
    console.log("Password reset email sent");
    res.json({
      message: "Password reset instructions sent to your email",
      emailSent: true,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to process password reset" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Token and new password are required",
    });
  }

  try {
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user document
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    // Optional: Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        template: "passwordResetSuccess",
        data: {
          fullName: user.fullName,
        },
      });
    } catch (emailError) {
      console.error(
        "Failed to send password reset confirmation email:",
        emailError
      );
      // Continue with password reset even if email fails
    }

    // Emit Socket.IO event for password reset
    io.emit("userPasswordReset", {
      userId: user._id,
      email: user.email,
      message: "User password has been reset",
    });

    res.json({
      message: "Password successfully reset",
      success: true,
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      message: "Failed to reset password",
      success: false,
    });
  }
};

const validateResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired reset token",
      });
    }

    res.json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token Validation Error:", error);
    res.status(500).json({
      valid: false,
      message: "Failed to validate token",
    });
  }
};
// 🚀 Get all users - simple version
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -resetPasswordToken -resetPasswordExpiry"
    );

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const updateProfile = async (req, res) => {
  const { userId, fullName, about, image, petOwnerDetails } = req.body;

  try {
    console.log("Request body received:", req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName !== undefined) {
      console.log("Updating fullName to:", fullName);
      user.fullName = fullName;
    }

    if (about !== undefined) {
      console.log("Updating about to:", about);
      user.about = about;
    }

    if (image !== undefined) {
      console.log("Updating image to:", image);
      user.image = image; // Enregistrer l’URL de l’image
    }

    if (user.role === "PetOwner" && petOwnerDetails) {
      if (
        (petOwnerDetails.address === undefined &&
          !user.petOwnerDetails?.address) ||
        (petOwnerDetails.phone === undefined && !user.petOwnerDetails?.phone)
      ) {
        return res.status(400).json({
          message: "Address and phone are required for PetOwner",
        });
      }

      console.log("Updating petOwnerDetails to:", petOwnerDetails);
      user.petOwnerDetails = {
        ...user.petOwnerDetails,
        ...petOwnerDetails,
      };
    }

    await user.save();
    console.log("Saved user with image:", user.image);
    console.log("Saved user full document:", user.toObject());

    // Emit Socket.IO event for profile update
    io.emit("userProfileUpdated", {
      userId: user._id,
      fullName: user.fullName,
      about: user.about,
      image: user.image,
      petOwnerDetails: user.petOwnerDetails,
      message: "User profile updated",
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        about: user.about,
        image: user.image,
        petOwnerDetails: user.petOwnerDetails,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const updateUserByAdmin = async (req, res) => {
  const { userId } = req.params;
  const { role, isActive, isArchieve } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (typeof isArchieve === "boolean") user.isArchieve = isArchieve;

    await user.save();

    // Emit Socket.IO event for admin update
    io.emit("userUpdatedByAdmin", {
      userId: user._id,
      role: user.role,
      isActive: user.isActive,
      isArchieve: user.isArchieve,
      message: "User updated by admin",
    });

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

const approveUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isActive) {
      return res.status(400).json({ message: "User is already active" });
    }

    user.isActive = true;
    await user.save();

    // Send email notification
    await sendEmail({
      to: user.email,
      template: "profileApproved",
      data: { fullName: user.fullName },
    });

    // Emit Socket.IO event for user approval
    io.emit("userApproved", {
      userId: user._id,
      fullName: user.fullName,
      role: user.role,
      message: "User approved and activated",
    });

    res.json({ message: "User approved and activated", user });
  } catch (error) {
    console.error("Approve User Error:", error);
    res.status(500).json({ message: "Failed to approve user" });
  }
};

const deleteUserByAdmin = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send rejection email before deletion
    await sendEmail({
      to: user.email,
      template: "profileRejected",
      data: { fullName: user.fullName },
    });
    console.log(`Rejection email sent to ${user.email}`);

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Emit Socket.IO event for user deletion
    io.emit("userDeletedByAdmin", {
      userId,
      message: "User deleted by admin",
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      isActive: true,
      isArchieve: false,
    });
    const inactiveUsers = await User.countDocuments({
      isActive: false,
      isArchieve: false,
    });
    const archivedUsers = await User.countDocuments({ isArchieve: true });
    const pendingUsers = await User.countDocuments({
      $or: [{ role: "Vet" }, { role: "Trainer" }],
      isActive: false,
      isArchieve: false,
      lastLogin: { $exists: false },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        archivedUsers,
        pendingUsers,
      },
    });
  } catch (error) {
    console.error("Get User Stats Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user stats" });
  }
};

// Vets module

// Get all active veterinarians - accessible to any authenticated user
const getVeterinarians = async (req, res) => {
  try {
    const veterinarians = await User.find({
      role: "Vet",
      isActive: true,
      isArchieve: false,
    })
      .select("fullName email image veterinarianDetails")
      .lean();

    console.log("Raw veterinarians from DB:", veterinarians); // Debug raw data

    if (!veterinarians.length) {
      console.log("No active veterinarians found");
    } else {
      console.log(`Found ${veterinarians.length} active veterinarians`);
    }

    res.json({
      success: true,
      count: veterinarians.length,
      veterinarians,
    });
  } catch (error) {
    console.error("Get Veterinarians Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch veterinarians",
    });
  }
};

const getVeterinarianById = async (req, res) => {
  console.log(
    "Handling GET /api/user/veterinarians/:id for vet:",
    req.params.id
  );
  try {
    const vet = await User.findOne({
      _id: req.params.id,
      role: "Vet",
      isActive: true,
      isArchieve: false,
    }).select("fullName image about veterinarianDetails"); // Exclude sensitive fields like email

    if (!vet) {
      console.log("Vet not found for ID:", req.params.id);
      return res
        .status(404)
        .json({ success: false, message: "Veterinarian not found" });
    }
    console.log("Vet found:", vet._id);

    res.json({
      success: true,
      vet: {
        _id: vet._id,
        fullName: vet.fullName,
        about: vet.about,
        image: vet.image,
        veterinarianDetails: vet.veterinarianDetails || undefined,
      },
    });
    console.log("Vet details fetched successfully for vet:", vet._id);
  } catch (error) {
    console.error("Get Veterinarian By ID Error:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch veterinarian details",
      detail: error.message,
    });
  }
};
const updateVetProfile = async (req, res) => {
  const { userId, fullName, image, veterinarianDetails } = req.body;

  try {
    console.log("Received update request:", req.body);

    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own profile" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "Vet") {
      return res.status(404).json({ message: "Veterinarian not found" });
    }

    // Update common fields (email is not included here as it should not be updated)
    if (fullName) user.fullName = fullName;
    if (image) user.image = image;

    if (veterinarianDetails) {
      const vetDetails = user.veterinarianDetails || {};

      // Fields that CAN be updated
      if (veterinarianDetails.title) {
        const validTitles = ["Doctor", "Professor"];
        if (!validTitles.includes(veterinarianDetails.title)) {
          return res.status(400).json({ message: "Invalid title" });
        }
        vetDetails.title = veterinarianDetails.title;
      }

      if (veterinarianDetails.averageConsultationDuration) {
        const validDurations = [10, 15, 20, 25, 30, 45, 50, 55, 60];
        const duration = parseInt(
          veterinarianDetails.averageConsultationDuration
        );
        if (!validDurations.includes(duration)) {
          return res
            .status(400)
            .json({ message: "Invalid consultation duration" });
        }
        vetDetails.averageConsultationDuration = duration;
      }

      if (veterinarianDetails.governorate) {
        vetDetails.governorate = veterinarianDetails.governorate;
      }

      if (veterinarianDetails.delegation)
        vetDetails.delegation = veterinarianDetails.delegation;
      if (veterinarianDetails.phone) {
        vetDetails.phone = veterinarianDetails.phone;
      } else if (
        veterinarianDetails.phone === null ||
        veterinarianDetails.phone === ""
      ) {
        return res
          .status(400)
          .json({ message: "Phone is required for Veterinarian" });
      }
      if (veterinarianDetails.secondaryPhone !== undefined) {
        vetDetails.secondaryPhone = veterinarianDetails.secondaryPhone;
      }

      if (veterinarianDetails.services) {
        vetDetails.services = veterinarianDetails.services.map((s) => ({
          serviceName: s.serviceName || "",
          fee: Math.max(0, parseFloat(s.fee) || 0),
        }));
      }

      if (veterinarianDetails.languagesSpoken) {
        vetDetails.languagesSpoken = veterinarianDetails.languagesSpoken;
      }

      if (veterinarianDetails.openingHours) {
        const validSessions = ["Single Session", "Double Session", "Closed"];
        for (const day of [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]) {
          if (veterinarianDetails.openingHours[day]) {
            if (
              !validSessions.includes(veterinarianDetails.openingHours[day])
            ) {
              return res
                .status(400)
                .json({ message: `Invalid session type for ${day}` });
            }
            vetDetails.openingHours = vetDetails.openingHours || {};
            vetDetails.openingHours[day] =
              veterinarianDetails.openingHours[day];
            ["Start", "End", "Start2", "End2"].forEach((suffix) => {
              const key = `${day}${suffix}`;
              if (veterinarianDetails.openingHours[key]) {
                vetDetails.openingHours[key] =
                  veterinarianDetails.openingHours[key];
              }
            });
          }
        }
      }

      if (veterinarianDetails.geolocation) {
        vetDetails.geolocation = {
          latitude:
            parseFloat(veterinarianDetails.geolocation.latitude) || 36.8665367,
          longitude:
            parseFloat(veterinarianDetails.geolocation.longitude) || 10.1647233,
        };
      }

      if (veterinarianDetails.clinicPhotos)
        vetDetails.clinicPhotos = veterinarianDetails.clinicPhotos;
      if (veterinarianDetails.businessCardImage)
        vetDetails.businessCardImage = veterinarianDetails.businessCardImage;

      // Fields that CANNOT be updated (diplomasAndTraining and specializations are ignored)
      user.veterinarianDetails = vetDetails;
    }

    await user.save();

    io.emit("userProfileUpdated", {
      userId: user._id,
      fullName: user.fullName,
      image: user.image,
      veterinarianDetails: user.veterinarianDetails,
      message: "Vet profile updated",
    });

    res.json({
      message: "Vet profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image,
        veterinarianDetails: user.veterinarianDetails,
      },
    });
  } catch (error) {
    console.error("Update Vet Profile Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update vet profile", detail: error.message });
  }
};

// Trainer module
// Get all active trainers - accessible to any authenticated user
const getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({
      role: "Trainer",
      isActive: true,
      isArchieve: false,
    })
      .select("fullName email image trainerDetails")
      .lean();

    console.log("Raw trainers from DB:", trainers);

    if (!trainers.length) {
      console.log("No active trainers found");
    } else {
      console.log(`Found ${trainers.length} active trainers`);
    }

    res.json({
      success: true,
      count: trainers.length,
      trainers,
    });
  } catch (error) {
    console.error("Get Trainers Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainers",
    });
  }
};

// Get trainer by ID - accessible to any authenticated user// Get trainer by ID
const getTrainerById = async (req, res) => {
  console.log(
    "Handling GET /api/user/trainers/:id for trainer:",
    req.params.id
  );
  try {
    const trainer = await User.findOne({
      _id: req.params.id,
      role: "Trainer",
      isActive: true,
      isArchieve: false,
    }).select("fullName image about trainerDetails");

    if (!trainer) {
      console.log("Trainer not found for ID:", req.params.id);
      return res
        .status(404)
        .json({ success: false, message: "Trainer not found" });
    }
    console.log("Trainer found:", trainer._id);

    res.json({
      success: true,
      trainer: {
        _id: trainer._id,
        fullName: trainer.fullName,
        about: trainer.about,
        image: trainer.image,
        trainerDetails: trainer.trainerDetails || undefined,
      },
    });
    console.log(
      "Trainer details fetched successfully for trainer:",
      trainer._id
    );
  } catch (error) {
    console.error("Get Trainer By ID Error:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainer details",
      detail: error.message,
    });
  }
};

// Submit a review for a trainer
const submitTrainerReview = async (req, res) => {
  const { trainerId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    // Validate trainerId
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ message: "Invalid trainer ID" });
    }

    const trainer = await User.findOne({
      _id: trainerId,
      role: "Trainer",
      isActive: true,
      isArchieve: false,
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Ensure trainerDetails exists
    if (!trainer.trainerDetails) {
      trainer.trainerDetails = {};
    }
    if (!trainer.trainerDetails.reviews) {
      trainer.trainerDetails.reviews = [];
    }

    // Check if user has already reviewed
    const existingReview = trainer.trainerDetails.reviews.find(
      (review) => review.userId.toString() === userId.toString()
    );
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this trainer" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Add review
    const newReview = {
      userId,
      rating,
      comment: comment || "",
      createdAt: new Date(),
    };
    trainer.trainerDetails.reviews.push(newReview);

    // Update average rating
    const totalRatings = trainer.trainerDetails.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    trainer.trainerDetails.rating =
      trainer.trainerDetails.reviews.length > 0
        ? totalRatings / trainer.trainerDetails.reviews.length
        : 0;

    await trainer.save();

    // Emit Socket.IO event for new review
    io.emit("trainerReviewSubmitted", {
      trainerId,
      review: newReview,
      newRating: trainer.trainerDetails.rating,
      message: "New review submitted for trainer",
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review: newReview,
      newRating: trainer.trainerDetails.rating,
    });
  } catch (error) {
    console.error("Submit Trainer Review Error:", error.stack);
    res
      .status(500)
      .json({ message: "Failed to submit review", detail: error.message });
  }
};

// Get reviews for a trainer
const getTrainerReviews = async (req, res) => {
  const { trainerId } = req.params;

  try {
    console.log("Fetching reviews for trainerId:", trainerId);

    // Validate trainerId
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      console.log("Invalid trainer ID:", trainerId);
      return res.status(400).json({ message: "Invalid trainer ID" });
    }

    console.log("Executing User.findOne for trainerId:", trainerId);
    const trainer = await User.findOne({
      _id: trainerId,
      role: "Trainer",
      isActive: true,
      isArchieve: false,
    }).select("trainerDetails.reviews trainerDetails.rating");

    if (!trainer) {
      console.log("Trainer not found for ID:", trainerId);
      return res.status(404).json({ message: "Trainer not found" });
    }

    console.log("Trainer found:", trainer._id);
    console.log("Raw trainerDetails:", trainer.trainerDetails);

    // Initialize trainerDetails if missing
    const trainerDetails = trainer.trainerDetails || {};
    console.log("Processed trainerDetails:", trainerDetails);

    // Ensure reviews is an array
    const reviews = Array.isArray(trainerDetails.reviews) ? trainerDetails.reviews : [];
    console.log("Processed reviews:", reviews);

    // Ensure rating is a number
    const rating = typeof trainerDetails.rating === "number" ? trainerDetails.rating : 0;
    console.log("Processed rating:", rating);

    // Manually populate userId fields if reviews exist
    const populatedReviews = await Promise.all(
      reviews.map(async (review) => {
        if (review.userId) {
          const user = await User.findById(review.userId)
            .select("fullName image")
            .lean()
            .catch((err) => {
              console.error("Failed to fetch user for review:", review.userId, err);
              return { fullName: "Anonymous", image: null };
            });
          return {
            ...review.toObject(),
            userId: user || { fullName: "Anonymous", image: null },
          };
        }
        return review.toObject();
      })
    );

    console.log("Populated reviews:", populatedReviews);

    res.json({
      success: true,
      rating,
      reviews: populatedReviews,
    });
  } catch (error) {
    console.error("Get Trainer Reviews Error:", {
      trainerId,
      error: error.message,
      stack: error.stack,
      trainerDetailsExists: !!trainer?.trainerDetails,
      reviewsType: trainer?.trainerDetails?.reviews ? typeof trainer.trainerDetails.reviews : "undefined",
    });
    res.status(500).json({ message: "Failed to fetch reviews", detail: error.message });
  }
};

const updateTrainerProfile = async (req, res) => {
  const { userId, fullName, image, gender, about, trainerDetails } = req.body;

  try {
    console.log("Received trainer update request:", req.body);

    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own profile" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "Trainer") {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Update common fields
    if (fullName) user.fullName = fullName;
    if (image) user.image = image;
    if (gender) user.gender = gender;
    if (about) user.about = about;

    if (trainerDetails) {
      const existingDetails = user.trainerDetails || {};

      // Fields that CAN be updated
      if (trainerDetails.trainingFacilityType) {
        const validTypes = ["Fixed Facility", "Mobile"];
        if (!validTypes.includes(trainerDetails.trainingFacilityType)) {
          return res.status(400).json({ message: "Invalid training facility type" });
        }
        existingDetails.trainingFacilityType = trainerDetails.trainingFacilityType;
      }

      if (trainerDetails.averageSessionDuration) {
        const duration = parseInt(trainerDetails.averageSessionDuration);
        if (isNaN(duration) || duration <= 0) {
          return res.status(400).json({ message: "Invalid session duration" });
        }
        existingDetails.averageSessionDuration = duration;
      }

      if (trainerDetails.governorate) existingDetails.governorate = trainerDetails.governorate;
      if (trainerDetails.delegation) existingDetails.delegation = trainerDetails.delegation;
      if (trainerDetails.phone) {
        if (!/^[234579]\d{7}$/.test(trainerDetails.phone)) {
          return res.status(400).json({ message: "Invalid phone number format" });
        }
        existingDetails.phone = trainerDetails.phone;
      } else {
        return res.status(400).json({ message: "Phone is required for Trainer" });
      }
      if (trainerDetails.secondaryPhone !== undefined) {
        if (trainerDetails.secondaryPhone && !/^[234579]\d{7}$/.test(trainerDetails.secondaryPhone)) {
          return res.status(400).json({ message: "Invalid secondary phone number format" });
        }
        existingDetails.secondaryPhone = trainerDetails.secondaryPhone;
      }

      if (trainerDetails.services) {
        existingDetails.services = trainerDetails.services.map((s) => ({
          serviceName: s.serviceName || "",
          fee: Math.max(0, parseFloat(s.fee) || 0),
        }));
      }

      if (trainerDetails.languagesSpoken) {
        if (!trainerDetails.languagesSpoken.length) {
          return res.status(400).json({ message: "At least one language is required" });
        }
        existingDetails.languagesSpoken = trainerDetails.languagesSpoken;
      }

      if (trainerDetails.openingHours) {
        const validSessions = ["Single Session", "Double Session", "Closed"];
        for (const day of [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]) {
          if (trainerDetails.openingHours[day]) {
            if (!validSessions.includes(trainerDetails.openingHours[day])) {
              return res.status(400).json({ message: `Invalid session type for ${day}` });
            }
            existingDetails.openingHours = existingDetails.openingHours || {};
            existingDetails.openingHours[day] = trainerDetails.openingHours[day];
            ["Start", "End", "Start2", "End2"].forEach((suffix) => {
              const key = `${day}${suffix}`;
              if (trainerDetails.openingHours[key] !== undefined) {
                existingDetails.openingHours[key] = trainerDetails.openingHours[key];
              }
            });
          }
        }
      }

      if (trainerDetails.geolocation) {
        existingDetails.geolocation = {
          latitude: parseFloat(trainerDetails.geolocation.latitude) || 36.81897,
          longitude: parseFloat(trainerDetails.geolocation.longitude) || 10.16579,
        };
      }

      if (trainerDetails.serviceAreas) existingDetails.serviceAreas = trainerDetails.serviceAreas;
      if (trainerDetails.trainingPhotos) existingDetails.trainingPhotos = trainerDetails.trainingPhotos;
      if (trainerDetails.breedsTrained) existingDetails.breedsTrained = trainerDetails.breedsTrained;
      if (trainerDetails.businessCardImage) existingDetails.businessCardImage = trainerDetails.businessCardImage;
      if (trainerDetails.socialLinks) existingDetails.socialLinks = trainerDetails.socialLinks;

      // Fields that CANNOT be updated
      existingDetails.certificationImage = existingDetails.certificationImage; // Preserve existing
      existingDetails.reviews = existingDetails.reviews || []; // Preserve reviews
      existingDetails.rating = existingDetails.rating || 0; // Preserve rating

      user.trainerDetails = existingDetails;
    }

    await user.save();

    io.emit("userProfileUpdated", {
      userId: user._id,
      fullName: user.fullName,
      image: user.image,
      gender: user.gender,
      about: user.about,
      trainerDetails: user.trainerDetails,
      message: "Trainer profile updated",
    });

    res.json({
      message: "Trainer profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image,
        gender: user.gender,
        about: user.about,
        trainerDetails: user.trainerDetails,
      },
    });
  } catch (error) {
    console.error("Update Trainer Profile Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update trainer profile", detail: error.message });
  }
};
export {
  createProfile,
  forgotPassword,
  getCurrentUser,
  login,
  register,
  resetPassword,
  getAllUsers,
  verifyToken,
  validateResetToken,
  updateProfile,
  updateUserByAdmin,
  approveUser,
  deleteUserByAdmin,
  getUserStats,
  getVeterinarians,
  getVeterinarianById,
  updateVetProfile,
  getTrainers,
  getTrainerById,
  submitTrainerReview,
  getTrainerReviews,
  updateTrainerProfile,
};
