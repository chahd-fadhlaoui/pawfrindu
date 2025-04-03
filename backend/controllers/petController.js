import Pet from "../models/petModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../services/emailService.js";
import { io } from "../server.js";
// Create a new pet
export const createPet = async (req, res) => {
  try {
    const {
      name,
      breed,
      age,
      city,
      gender,
      species,
      fee,
      isTrained,
      image,
      description,
    } = req.body;

    // Manual validation
    if (
      !name ||
      !age ||
      !city ||
      !gender ||
      !species ||
      !image ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const validSpecies = ["dog", "cat", "other"];
    if (!validSpecies.includes(species)) {
      return res.status(400).json({
        success: false,
        message: "Invalid species value",
      });
    }

    const validAges = ["puppy", "kitten", "young", "adult", "senior"];
    if (!validAges.includes(age)) {
      return res.status(400).json({
        success: false,
        message: "Invalid age value",
      });
    }

    // Get owner ID from authenticated user
    const ownerId = req.user._id;

    // Determine status and approval based on user role
    const isAdmin = req.user.role === "Admin";
    const status = isAdmin ? "accepted" : "pending";
    const isApproved = isAdmin;

    // Create new pet
    const newPet = new Pet({
      name,
      breed,
      age,
      city,
      gender,
      species,
      fee,
      isTrained: Boolean(isTrained),
      image,
      description,
      owner: ownerId,
      status,
      isApproved,
    });

    await newPet.save();

    // Emit Socket.IO event to all connected clients
    io.emit("petCreated", {
      pet: newPet,
      message: "A new pet has been added",
    });

    return res.status(201).json({
      success: true,
      message: "Pet created successfully",
      data: newPet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating pet",
      error: error.message,
    });
  }
};

export const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find().populate("owner", "fullName email");

    // Sanitize the pet data
    const sanitizedPets = pets.map((pet) => ({
      ...pet._doc, // Spread the document properties
      species: pet.species || pet.category || "unknown", // Fallback for missing species or legacy category
      age: pet.age || "unknown", // Fallback for missing age
      breed: pet.breed || "", // Ensure breed is a string
      city: pet.city || "Unknown", // Fallback for missing city
      fee: pet.fee !== undefined ? pet.fee : 0, // Default to 0 if fee is missing
      status: pet.status || "pending", // Default status if missing
    }));

    return res.status(200).json({
      success: true,
      count: sanitizedPets.length,
      data: sanitizedPets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching pets",
      error: error.message,
    });
  }
};

// Get pet by ID
export const getPetById = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await Pet.findById(id).populate("owner", "fullName email");

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching pet details",
      error: error.message,
    });
  }
};

// Modify pet status (admin action)
export const modifyPetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedPet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    // Emit Socket.IO event
    io.emit("petUpdated", {
      petId: id,
      updatedPet,
      message: "Pet status modified",
    });


    return res.status(200).json({
      success: true,
      message: "Pet updated successfully",
      data: updatedPet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating pet",
      error: error.message,
    });
  }
};

// Update pet
export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Find pet first to check ownership and current state
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    // Check if user is the owner of the pet
    if (
      pet.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own pets",
      });
    }

    // Define significant fields that require re-approval
    const significantFields = [
      "description",
      "image",
      "fee",
      "species",
      "breed",
      "name",
      "gender",
      "isTrained",
    ];
    const requiresApproval = significantFields.some(
      (field) =>
        updateData[field] !== undefined && updateData[field] !== pet[field]
    );

    // If significant changes are made and not by an admin, reset status to pending
    if (requiresApproval && req.user.role !== "Admin") {
      updateData.status = "pending";
      updateData.isApproved = false; // Reset approval status
    }

    // Update the pet
    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Emit Socket.IO event
    io.emit("petUpdated", {
      petId: id,
      updatedPet,
      message:
        requiresApproval && req.user.role !== "Admin"
          ? "Pet updated, pending approval"
          : "Pet updated successfully",
    });

    return res.status(200).json({
      success: true,
      message:
        requiresApproval && req.user.role !== "Admin"
          ? "Pet updated successfully, pending admin approval"
          : "Pet updated successfully",
      data: updatedPet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating pet",
      error: error.message,
    });
  }
};

// Delete pet (PetOwner action)
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own pets" });
    }

    let message = "";
    if (pet.status === "pending") {
      await Pet.findByIdAndDelete(id);
      message = "Pet deleted successfully";
    } else if (pet.status === "accepted") {
      if (pet.candidates.length > 0) {
        pet.isArchived = true;
        await pet.save();
        message = "Pet archived successfully";
      } else {
        await Pet.findByIdAndDelete(id);
        message = "Pet deleted successfully";
      }
    } else if (pet.status === "adopted" || pet.status === "sold") {
      pet.isArchived = true;
      await pet.save();
      message = "Pet archived successfully";
    } else {
      return res.status(400).json({ success: false, message: "Invalid action for this pet status" });
    }

    // Emit Socket.IO event
    io.emit("petDeleted", {
      petId: id,
      isArchived: pet.isArchived,
      message,
    });

    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error processing request", error: error.message });
  }
};

// Apply to adopt a pet
export const applyToAdopt = async (req, res) => {
  console.log("Entering applyToAdopt");
  try {
    console.log("Received request:", { params: req.params, body: req.body });

    const { petId } = req.params;
    const userId = req.user?._id;
    const { occupation, workSchedule, housing, reasonForAdoption, readiness } =
      req.body;

    console.log("petId:", petId);
    console.log("userId:", userId);
    console.log("Request body:", {
      occupation,
      workSchedule,
      housing,
      reasonForAdoption,
      readiness,
    });

    if (!userId) {
      console.error("No user ID found in request");
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for ID:", userId);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      console.error("Pet not found for ID:", petId);
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (pet.status !== "accepted") {
      console.warn("Pet status not accepted:", pet.status);
      return res.status(400).json({
        success: false,
        message: `Pet is not available for adoption (current status: ${pet.status})`,
      });
    }

    if (!pet.owner) {
      console.error("Pet has no owner:", pet);
      return res
        .status(400)
        .json({ success: false, message: "Pet has no owner defined" });
    }
    if (pet.owner.toString() === userId.toString()) {
      console.warn("User is the owner of the pet");
      return res
        .status(400)
        .json({ success: false, message: "You cannot adopt your own pet" });
    }

    // Check if user is already a candidate
    const isCandidate = pet.candidates.some(
      (candidate) =>
        candidate.user && candidate.user.toString() === userId.toString()
    );
    if (isCandidate) {
      console.log("User is already a candidate:", userId);
      return res.status(400).json({
        success: false,
        message: "You have already applied to adopt this pet",
      });
    }

    // Add user to candidates
    pet.candidates.push({ user: userId, status: "pending" });
    console.log("Adding user to candidates:", pet.candidates);
    await pet.save();
    console.log("Pet saved successfully");

    user.petOwnerDetails = {
      ...user.petOwnerDetails,
      occupation,
      workSchedule,
      housing: {
        type: housing.type,
        ownership: housing.ownership,
        familySize: housing.familySize,
        landlordApproval: housing.landlordApproval,
      },
      reasonForAdoption,
      readiness,
    };

    console.log("Updating user with petOwnerDetails:", user.petOwnerDetails);
    await user.save();
    console.log("User saved successfully");

    // Emit Socket.IO event
    io.emit("adoptionApplied", {
      petId: pet._id,
      userId: user._id,
      petName: pet.name,
      species: pet.species,
      city: pet.city,
      image: pet.image,
      gender: pet.gender,
      message: `${user.fullName} applied to adopt ${pet.name}`,
    });

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      data: {
        pet,
        user: {
          _id: user._id,
          petOwnerDetails: user.petOwnerDetails,
        },
      },
    });
  } catch (error) {
    console.error("Error in applyToAdopt:", error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: "Error applying for adoption",
      error: error.message,
    });
  }
};

// Delete pet (admin action)
export const deleteAdminPet = async (req, res) => {
  try {
    const { id } = req.params;

    // Chercher le pet directement sans validation explicite de l'ID
    const pet = await Pet.findById(id);
    if (!pet) {
      return res
        .status(404)
        .json({ success: false, message: "Animal non trouvé" });
    }

    // Supprimer le pet
    await Pet.findByIdAndDelete(id);
    // Emit Socket.IO event
    io.emit("petDeleted", {
      petId: id,
      isArchived: false,
      message: "Pet deleted by admin",
    });

    return res
      .status(200)
      .json({ success: true, message: "Animal supprimé avec succès" });
  } catch (error) {
    console.error("Erreur dans deleteAdminPet :", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};

// Archive pet
export const archivePet = async (req, res) => {
  try {
    const { id } = req.params;

    // Chercher le pet directement sans validation explicite de l'ID
    const pet = await Pet.findById(id);
    if (!pet) {
      return res
        .status(404)
        .json({ success: false, message: "Animal non trouvé" });
    }

    // Vérifier si le pet est déjà archivé
    if (pet.isArchived) {
      return res
        .status(400)
        .json({ success: false, message: "Cet animal est déjà archivé" });
    }

    // Vérifier si le statut permet l'archivage
    if (pet.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Seuls les animaux pending ne pouvent pas être archivés",
      });
    }

    // Archiver le pet
    pet.isArchived = true;
    await pet.save();

    // Emit Socket.IO event
    io.emit("petArchived", {
      petId: id,
      message: "Pet archived successfully",
    });

    return res
      .status(200)
      .json({ success: true, message: "Animal archivé avec succès" });
  } catch (error) {
    console.error("Erreur dans archivePet :", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'archivage",
      error: error.message,
    });
  }
};

// Get pets by owner (my pets)
export const getMyPets = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const pets = await Pet.find({ owner: ownerId });

    return res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching your pets",
      error: error.message,
    });
  }
};

// Admin approve pet listing (Admin action)
export const approvePet = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can approve pets",
      });
    }

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    pet.isApproved = true;
    pet.status = "available";

    await pet.save();

    // Emit Socket.IO event
    io.emit("petApproved", {
      petId: id,
      updatedPet: pet,
      message: "Pet approved by admin",
    });

    return res.status(200).json({
      success: true,
      message: "Pet approved successfully",
      data: pet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving pet",
      error: error.message,
    });
  }
};

// Get pets by status
export const getPetsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status is one of the enum values
    const validStatuses = ["pending", "available", "adopted", "sold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: pending, available, adopted, sold",
      });
    }

    const pets = await Pet.find({ status }).populate("owner", "fullName email");

    return res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching pets by status",
      error: error.message,
    });
  }
};

// Approve adoption (for pet owners to approve an adopter)
export const approveAdoption = async (req, res) => {
  try {
    const { petId, adopterId } = req.params;

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    // Check if user is the owner of the pet
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized: You can only approve adoptions for your own pets",
      });
    }

    // Check if adopter is in candidates list
    if (!pet.candidates.includes(adopterId)) {
      return res.status(400).json({
        success: false,
        message: "This user has not applied to adopt this pet",
      });
    }

    // Update pet status to adopted
    pet.status = "adopted";
    await pet.save();

    // Emit Socket.IO event
    io.emit("adoptionApproved", {
      petId,
      adopterId,
      message: "Adoption approved successfully",
    });


    return res.status(200).json({
      success: true,
      message: "Adoption approved successfully",
      data: pet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving adoption",
      error: error.message,
    });
  }
};

// Unarchive pet
export const unarchivePet = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (!pet.isArchived) {
      return res
        .status(400)
        .json({ success: false, message: "Pet is not archived" });
    }

    pet.isArchived = false;
    await pet.save();

    // Emit Socket.IO event
    io.emit("petUnarchived", {
      petId: id,
      message: "Pet unarchived successfully",
    });

    return res
      .status(200)
      .json({ success: true, message: "Pet unarchived successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error unarchiving pet",
      error: error.message,
    });
  }
};

// Get candidates for a specific pet
export const getPetCandidates = async (req, res) => {
  try {
    const { petId } = req.params;
    console.log("Fetching pet with ID:", petId);
    console.time("getPetCandidates");

    const pet = await Pet.findById(petId).populate({
      path: "candidates.user",
      select: "-password",
    });
    console.log("Pet query completed");
    console.log("Pet found:", pet ? pet._id : "Not found");
    console.log("Raw pet candidates:", pet ? pet.candidates : "No pet");

    if (!pet) {
      console.log("Pet not found for ID:", petId);
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    console.log("Candidates raw data:", pet.candidates);
    console.log("Pet owner ID:", pet.owner.toString());
    console.log("Request user ID:", req.user?._id);
    if (
      !req.user ||
      (pet.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "Admin")
    ) {
      console.log("Unauthorized access attempt by:", req.user?._id);
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only the owner can view candidates",
      });
    }
    const candidates = pet.candidates.map((candidate) => {
      const user = candidate.user || {}; // Fallback to empty object if user is null
      return {
        id: candidate.user?._id || candidate._id.toString(), // Use candidate._id if user is missing
        name: user.fullName || "Unknown User",
        email: user.email || "N/A",
        image: user.image || "N/A",
        status: candidate.status || "pending",
        petOwnerDetails: {
          occupation: user.petOwnerDetails?.occupation || "N/A",
          workSchedule: user.petOwnerDetails?.workSchedule || "N/A",
          housing: {
            type: user.petOwnerDetails?.housing?.type || "N/A",
            ownership: user.petOwnerDetails?.housing?.ownership || "N/A",
            familySize: user.petOwnerDetails?.housing?.familySize || "N/A",
            landlordApproval:
              user.petOwnerDetails?.housing?.landlordApproval || false,
          },
          reasonForAdoption: user.petOwnerDetails?.reasonForAdoption || "N/A",
          readiness: user.petOwnerDetails?.readiness || "N/A",
          phone:
            candidate.status === "approved"
              ? user.petOwnerDetails?.phone
              : undefined,
        },
      };
    });

    console.log("All formatted candidates:", candidates);
    console.timeEnd("getPetCandidates");
    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error("Get Pet Candidates Error:", error.stack);
    console.timeEnd("getPetCandidates");
    return res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
};

// Update candidate status 
export const updateCandidateStatus = async (req, res) => {
  try {
    const { petId, candidateId } = req.params;
    const { status } = req.body; // "approved" ou "rejected"

    console.log("Updating candidate status:", { petId, candidateId, status });

    const pet = await Pet.findById(petId);
    if (!pet) {
      console.log("Pet not found:", petId);
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    console.log("Pet owner:", pet.owner.toString(), "User:", req.user?._id);
    if (pet.owner.toString() !== req.user._id.toString()) {
      console.log("Unauthorized access attempt by:", req.user?._id);
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const candidateIndex = pet.candidates.findIndex(
      (c) => c.user.toString() === candidateId
    );
    console.log("Candidate index:", candidateIndex);
    if (candidateIndex === -1) {
      console.log("Candidate not found:", candidateId);
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    const currentStatus = pet.candidates[candidateIndex].status;
    console.log("Current candidate status:", currentStatus);

    if (status === "approved") {
      // Rejeter automatiquement tous les autres candidats de manière définitive
      pet.candidates.forEach((candidate, index) => {
        if (index !== candidateIndex && candidate.status !== "rejected") {
          candidate.status = "rejected";
          console.log(`Auto-rejecting candidate ${candidate.user.toString()}`);
        }
      });
      pet.candidates[candidateIndex].status = "approved";
      pet.status = "adoptionPending";
    } else if (status === "rejected") {
      pet.candidates[candidateIndex].status = "rejected";

      // Vérifier si c'était le seul candidat approuvé
      const approvedCandidates = pet.candidates.filter(
        (c) => c.status === "approved"
      );

      // Si le candidat rejeté était auparavant approuvé et qu'il n'y a plus de candidats approuvés,
      // remettre le statut de l'animal à "accepted"
      if (currentStatus === "approved" && approvedCandidates.length === 0) {
        pet.status = "accepted";
        console.log(
          "Pet status reverted to accepted due to rejection of approved candidate"
        );
      }
    } else {
      console.log("Invalid status received:", status);
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    await pet.save();

    // Emit Socket.IO event
    io.emit("candidateStatusUpdated", {
      petId,
      candidateId,
      status,
      updatedPet: pet,
      message: `Candidate status updated to ${status}`,
    });

    console.log(
      "Candidate updated successfully:",
      pet.candidates[candidateIndex]
    );
    return res.status(200).json({
      success: true,
      message: `Candidate updated to ${status} successfully`,
      data: pet,
    });
  } catch (error) {
    console.error("Update Candidate Status Error:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error updating candidate status",
      error: error.message,
    });
  }
};
export const finalizeAdoption = async (req, res) => {
  try {
    const { petId, candidateId } = req.params;
    const { action } = req.body;

    console.log("Finalizing adoption:", { petId, candidateId, action });

    const pet = await Pet.findById(petId);
    if (!pet) {
      console.log("Pet not found:", petId);
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      console.log("Unauthorized access attempt by:", req.user?._id);
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const candidateIndex = pet.candidates.findIndex(
      (c) => c.user.toString() === candidateId
    );
    if (candidateIndex === -1) {
      console.log("Candidate not found:", candidateId);
      return res.status(400).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (action === "adopt") {
      pet.status = "adopted";
      pet.candidates[candidateIndex].status = "approved";
      pet.candidates.forEach((candidate, index) => {
        if (index !== candidateIndex && candidate.status !== "rejected") {
          candidate.status = "rejected";
          console.log(
            `Auto-rejecting candidate ${candidate.user.toString()} during adoption`
          );
        }
      });
    } else if (action === "reject") {
      pet.candidates[candidateIndex].status = "rejected";
      const stillApproved = pet.candidates.some((c) => c.status === "approved");
      pet.status = stillApproved ? "adoptionPending" : "accepted";
      console.log("Pet status after rejection:", pet.status);
    } else {
      console.log("Invalid action received:", action);
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    await pet.save();
    console.log("Adoption finalized:", {
      petStatus: pet.status,
      candidateStatus: pet.candidates[candidateIndex].status,
    });

    // Emit Socket.IO event
    io.emit("adoptionFinalized", {
      petId,
      candidateId,
      action,
      updatedPet: pet,
      message: `Adoption ${action === "adopt" ? "finalized" : "rejected"} successfully`,
    });

    return res.status(200).json({
      success: true,
      message: `Adoption ${
        action === "adopt" ? "finalized" : "rejected"
      } successfully`,
      data: pet,
    });
  } catch (error) {
    console.error("Finalize Adoption Error:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error finalizing adoption",
      error: error.message,
    });
  }
};

export const getMyAdoptionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all pets where the user is a candidate
    const pets = await Pet.find({
      "candidates.user": userId,
      isArchived: false,
    })
      .select(
        "name species city image status candidates breed age gender fee isTrained description owner"
      )
      .populate("owner", "fullName"); // Populate owner with fullName only

    console.log("Adoption requests pets fetched:", pets);
    // Transform the data to focus on the user's applications
    const applications = pets.map((pet) => {
      const candidate = pet.candidates.find(
        (c) => c.user.toString() === userId.toString()
      );
      return {
        pet: {
          _id: pet._id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          fee: pet.fee,
          isTrained: pet.isTrained,
          city: pet.city,
          image: pet.image,
          description: pet.description,
          owner: pet.owner ? pet.owner.fullName : "Unknown", // Ensure owner name is included
          status: pet.status,
        },
        status: candidate.status,
        user: userId,
      };
    }).filter(app => app.status); // Filter out applications without a status

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Get My Adoption Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching adoption requests",
      error: error.message,
    });
  }
};

// Get pet stats
export const getPetStats = async (req, res) => {
  try {
    const { startDate, endDate, species } = req.query;
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          }
        : {};
    const speciesFilter = species && species !== "all" ? { species } : {};

    const totalPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
    });
    const pendingPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
      status: "pending",
      isArchived: false,
    });
    const acceptedPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
      status: "accepted",
      isArchived: false,
    });
    const adoptionPendingPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
      status: "adoptionPending",
      isArchived: false,
    });
    const adoptedPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
      status: "adopted",
      isArchived: false,
    });
    const soldPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
      status: "sold",
      isArchived: false,
    });
    const archivedPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
      isArchived: true,
    });
    const approvedPets = await Pet.countDocuments({
      ...dateFilter,
      ...speciesFilter,
      isApproved: true,
      isArchived: false,
    });

    res.json({
      success: true,
      stats: {
        totalPets,
        pendingPets,
        acceptedPets,
        adoptionPendingPets,
        adoptedPets,
        soldPets,
        archivedPets,
        approvedPets,
      },
    });
  } catch (error) {
    console.error("Get Pet Stats Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch pet stats" });
  }
};

// Get my adopted pets
export const getMyAdoptedPets = async (req, res) => {
  try {
    const userId = req.user._id;

    const pets = await Pet.find({
      candidates: {
        $elemMatch: {
          user: userId,
          status: "approved",
        },
      },
      status: "adopted",
      isArchived: false,
    })
      .select(
        "name species city image status candidates breed age gender fee isTrained description owner updatedAt"
      )
      .populate("owner", "fullName");

    console.log("Adopted pets fetched (Full):", JSON.stringify(pets, null, 2)); // Log full pets

    const adoptedPets = pets.map((pet) => {
      const candidate = pet.candidates.find(
        (c) => c.user.toString() === userId.toString()
      );
      return {
        _id: pet._id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        fee: pet.fee,
        isTrained: pet.isTrained,
        city: pet.city,
        image: pet.image,
        description: pet.description,
        owner: pet.owner ? pet.owner.fullName : "Unknown",
        status: pet.status,
        adoptedDate: pet.updatedAt,
        candidateStatus: candidate ? candidate.status : "N/A", // Include for debugging
      };
    });

    return res.status(200).json({
      success: true,
      count: adoptedPets.length,
      data: adoptedPets,
    });
  } catch (error) {
    console.error("Get My Adopted Pets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching adopted pets",
      error: error.message,
    });
  }
};

// Send rejection email
export const sendRejectionEmail = async (req, res) => {
  try {
    const { petId, ownerEmail, petName } = req.body;

    // Validate input
    if (!petId || !ownerEmail || !petName) {
      return res.status(400).json({
        success: false,
        message: "Pet ID, owner email, and pet name are required",
      });
    }

    // Fetch owner details (optional, for full name)
    const owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    // Send rejection email
    const emailSent = await sendEmail({
      to: ownerEmail,
      template: "petRejected",
      data: {
        ownerFullName: owner.fullName,
        petName,
      },
    });

    if (!emailSent) {
      console.warn("Email sending failed but rejection process continues");
    }

    res.status(200).json({
      success: true,
      message: "Rejection email sent successfully",
    });
  } catch (error) {
    console.error("Error in sendRejectionEmail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send rejection email",
      error: error.message,
    });
  }
};
