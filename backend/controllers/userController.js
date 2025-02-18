import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";




// 🚀 Étape 1: Enregistrement de l'utilisateur sans détails spécifiques
const register = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with basic details
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    // Save user and generate token
    const savedUser = await newUser.save(); // Save user first

    if (!savedUser) {
      throw new Error("User not saved properly.");
    }

    // Now generate the token after user is successfully saved
    const accessToken = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    res.status(201).json({
      message: "Account created. Please complete your profile.",
      accessToken, // Send the token back in response
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Failed to create account." });
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
  try {
    const user = await User.findById(req.userId).select('-password');
    
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
        image: user.image,
        lastLogin: user.lastLogin,
        petOwnerDetails: user.petOwnerDetails || undefined,
        trainerDetails: user.trainerDetails || undefined,
        veterinarianDetails: user.veterinarianDetails || undefined,
        isArchieve: user.isArchieve,
      }
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// Middleware to verify token
 const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
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
export { register, createProfile, login, getCurrentUser, verifyToken };
