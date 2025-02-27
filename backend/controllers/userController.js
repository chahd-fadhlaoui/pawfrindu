import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { sendEmail } from "../services/emailService.js";
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

    // Save user first
    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new Error("User not saved properly.");
    }

    // Generate token after user is successfully saved
    const accessToken = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    // Try to send welcome email, but don't let it block registration if it fails
    try {
      await sendEmail({
        to: savedUser.email,
        template: "welcome",
        data: savedUser.fullName,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue with registration even if email fails
    }

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
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Failed to create account.",
      detail: error.message, // Add this for debugging
    });
  }
};

// 🚀 Étape 2: Complétion du profil et génération du token
const createProfile = async (req, res) => {
  const { userId, image } = req.body;
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
      if (!veterinarianDetails?.location || !veterinarianDetails?.degree) {
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
      profileImage: user.image, // Send back the saved image URL
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
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    res.json({
      message: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        petOwnerDetails: user.petOwnerDetails || undefined,
        trainerDetails: user.trainerDetails || undefined,
        veterinarianDetails: user.veterinarianDetails || undefined,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// 🚀 Get current user profile
const getCurrentUser = async (req, res) => {
  console.log('Handling GET /api/user/me for user:', req.user._id);
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        about: user.about,
        image: user.image,
        lastLogin: user.lastLogin,
        petOwnerDetails: user.petOwnerDetails || undefined,
        trainerDetails: user.trainerDetails || undefined,
        veterinarianDetails: user.veterinarianDetails || undefined,
        isArchieve: user.isArchieve,
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
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
    const users = await User.find({ isArchieve: false })
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
  updateProfile
};
