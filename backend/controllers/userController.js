import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

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

        // Créer un nouvel utilisateur avec uniquement les champs de base
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role,
            // Ne pas initialiser les détails spécifiques ici
        });

        await newUser.save();
        res.status(201).json({ message: "Account created. Please complete your profile." });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Failed to create account." });
    }
};
// 🚀 Étape 2: Complétion du profil et génération du token
const createProfile = async (req, res) => {
    const { userId } = req.body;
    const { petOwnerDetails, trainerDetails, veterinarianDetails } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Vérifier le rôle de l'utilisateur et remplir les détails spécifiques
        if (user.role === "PetOwner") {
            if (!petOwnerDetails?.address || !petOwnerDetails?.phone) {
                return res.status(400).json({ message: "Address and phone are required for Pet Owner." });
            }
            if (petOwnerDetails.petExperience && petOwnerDetails.petExperience._id) {
                delete petOwnerDetails.petExperience._id;  // Suppression de l'ID
            }
            user.petOwnerDetails = petOwnerDetails;
        } else if (user.role === "Trainer") {
            if (!trainerDetails?.location || !trainerDetails?.certification) {
                return res.status(400).json({ message: "Location and certification are required for Trainer." });
            }
            user.trainerDetails = trainerDetails;
        } else if (user.role === "Veterinarian") {
            if (!veterinarianDetails?.location || !veterinarianDetails?.degree) {
                return res.status(400).json({ message: "Location and degree are required for Veterinarian." });
            }
            user.veterinarianDetails = veterinarianDetails;
        }

        // Sauvegarder les modifications
        await user.save();

        // Génération du token après la complétion du profil
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "72h" }
        );

        res.json({
            message: "Profile completed successfully!",
            accessToken,
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
                veterinarianDetails: user.veterinarianDetails || undefined
            },
            accessToken,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login failed" });
    }
};
export { register, createProfile , login };
