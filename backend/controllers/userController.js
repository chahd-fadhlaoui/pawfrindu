import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { sendEmail } from "../services/emailService.js";


// 🚀 Étape 1: Enregistrement de l'utilisateur sans détails spécifiques
const register = async (req, res) => {
  console.log("Received registration request with body:", req.body);
  const { fullName, email, password, role, adminType } = req.body;

  if (!fullName || !email || !password || !role) {
    console.log("Missing fields:", { hasFullName: !!fullName, hasEmail: !!email, hasPassword: !!password, hasRole: !!role });
    return res.status(400).json({ message: "All fields are required." });
  }

  if (role === "Admin" && !adminType) {
    return res.status(400).json({ message: "Admin type is required for Admin role." });
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
      ...(role === "Admin" ? { adminType } : {}),
    });

    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new Error("User not saved properly.");
    }

    const accessToken = jwt.sign(
      { userId: savedUser._id, role: savedUser.role, adminType: savedUser.adminType },
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

    res.status(201).json({
      message: "Account created. Please complete your profile.",
      accessToken,
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role,
        adminType: savedUser.adminType,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.stack);
    res.status(500).json({ message: "Failed to create account", detail: error.message });
  }
};

// 🚀 Étape 2: Complétion du profil et génération du token
const createProfile = async (req, res) => {
  const { userId, image, gender} = req.body;
  const { petOwnerDetails, trainerDetails, veterinarianDetails } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user's image if provided
    if (image) {
      user.image = image;
    }
   // Ajouter la gestion du champ gender
   if (gender) {
    user.gender = gender;
  }
    // Rest of your existing role-specific logic
    if (user.role === "PetOwner") {
      if (!petOwnerDetails?.address || !petOwnerDetails?.phone) {
        return res
          .status(400)
          .json({ message: "Address and phone are required for Pet Owner." });
      }
      if (petOwnerDetails.petExperience && petOwnerDetails.petExperience._id) {
        delete petOwnerDetails.petExperience._id;
      }
      user.petOwnerDetails = petOwnerDetails;
    } else if (user.role === "Trainer") {
      if (!trainerDetails?.location || !trainerDetails?.certification) {
        return res.status(400).json({
          message: "Location and certification are required for Trainer.",
        });
      }
      user.trainerDetails = trainerDetails;
    } else if (user.role === "Vet") {
      if (!veterinarianDetails?.governorate || !veterinarianDetails?.diplomasAndTraining) {
        return res.status(400).json({
          message: "Location and degree are required for Veterinarian.",
        });
      }
      user.veterinarianDetails = veterinarianDetails;
    }

    // Save all changes including the image
    await user.save();

    // Generate token after profile completion
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );
    res.json({
      message: "Profile completed successfully!",
      accessToken,
      user,
      // profileImage: user.image, // Send back the saved image URL
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
      return res.status(500).json({ message: "User password is missing in database" });
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
    console.log("Initial state - isActive:", user.isActive, "lastLogin:", user.lastLogin);

    // Vet-specific logic
    if (user.role === "Vet") {
      if (!user.isActive && !user.lastLogin) {
        console.log("Case 1: Inactive, first login detected");
        redirectTo = "/vet-pending-approval";
        shouldUpdateLastLogin = false; // Don’t store lastLogin
      } else if (user.isActive) {
        console.log("Case 2/3: Active vet detected");
        redirectTo = "/vet";
        shouldUpdateLastLogin = true; // Store or update lastLogin
      } else if (!user.isActive && user.lastLogin) {
        console.log("Case 4: Inactive, previously logged in (deactivated)");
        redirectTo = "/vet";
        shouldUpdateLastLogin = false; // Don’t update lastLogin
      }
    } else {
      console.log("Non-vet user detected");
      redirectTo =
        user.role === "PetOwner"
          ? "/"
          : user.role === "Trainer"
          ? "/trainer"
          : user.role === "Admin"
          ? "/admin"
          : "/login";
      shouldUpdateLastLogin = true;
    }

    // Log decision
    console.log("Decision - redirectTo:", redirectTo, "shouldUpdateLastLogin:", shouldUpdateLastLogin);

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
        adminType: user.adminType || (user.role === "Admin" ? "Super Admin" : undefined),
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
        adminType: user.adminType || (user.role === "Admin" ? "Super Admin" : undefined),
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
  console.log('Handling GET /api/user/me for user:', req.user._id);
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      console.log("User not found for ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user._id);

    let shouldUpdateLastLogin = false;

    // Vet-specific logic (mirrors login function)
    if (user.role === "Vet") {
      if (!user.isActive && !user.lastLogin) {
        console.log("Case 1: Inactive vet, first fetch - skipping lastLogin update");
        shouldUpdateLastLogin = false;
      } else if (user.isActive) {
        console.log("Case 2/3: Active vet - updating lastLogin");
        shouldUpdateLastLogin = true;
      } else if (!user.isActive && user.lastLogin) {
        console.log("Case 4: Inactive vet, previously logged in - skipping lastLogin update");
        shouldUpdateLastLogin = false;
      }
    } else {
      console.log("Non-vet user - updating lastLogin");
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
        adminType: user.adminType || (user.role === "Admin" ? "Super Admin" : undefined),
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
      detail: error.message 
    });
  }
};

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.adminType = decoded.adminType || (decoded.role === "Admin" ? "Super Admin" : undefined); // Secours pour anciens tokens
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
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
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpiry');

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch users" 
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
        (petOwnerDetails.address === undefined && !user.petOwnerDetails?.address) ||
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
  const { role, adminType, isActive, isArchieve } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (role) user.role = role;
    if (role === "Admin" && adminType) user.adminType = adminType;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (typeof isArchieve === "boolean") user.isArchieve = isArchieve;

    await user.save();
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

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true, isArchieve: false });
    const inactiveUsers = await User.countDocuments({ isActive: false, isArchieve: false });
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
    res.status(500).json({ success: false, message: "Failed to fetch user stats" });
  }
};

// Vets module 

// Get all active veterinarians - accessible to any authenticated user
const getVeterinarians = async (req, res) => {
  try {
    const veterinarians = await User.find({ 
      role: "Vet", 
      isActive: true,
      isArchieve: false 
    })
      .select('fullName email image veterinarianDetails')
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
      message: "Failed to fetch veterinarians" 
    });
  }
};


const getVeterinarianById = async (req, res) => {
  console.log('Handling GET /api/user/veterinarians/:id for vet:', req.params.id);
  try {
    const vet = await User.findOne({ 
      _id: req.params.id, 
      role: "Vet", 
      isActive: true, 
      isArchieve: false 
    }).select("fullName image about veterinarianDetails"); // Exclude sensitive fields like email

    if (!vet) {
      console.log("Vet not found for ID:", req.params.id);
      return res.status(404).json({ success: false, message: "Veterinarian not found" });
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
      detail: error.message 
    });
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
  getVeterinarianById
};
