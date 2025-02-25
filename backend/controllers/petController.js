import Pet from '../models/petModel.js'
import User from '../models/userModel.js'
// Create a new pet
export const createPet = async (req, res) => {
  try {
    const { 
      name, breed, age, city, gender, 
      species, fee, isTrained, image, description 
    } = req.body;
    
    // Manual validation
    if (!name || !age || !city || !gender || !species || !image || !description) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const validSpecies = ["dog", "cat", "other"];
    if (!validSpecies.includes(species)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid species value'
      });
    }

    const validAges = ["puppy", "kitten", "young", "adult", "senior"];
    if (!validAges.includes(age)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid age value'
      });
    }

    // Get owner ID from authenticated user
    const ownerId = req.user._id;
    
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
      status: 'pending',
      isApproved: false
    });
    
    await newPet.save();
    
    return res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: newPet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating pet',
      error: error.message
    });
  }
};

export const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find()
      .populate('owner', 'fullName email');

    // Sanitize the pet data
    const sanitizedPets = pets.map(pet => ({
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
      data: sanitizedPets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching pets',
      error: error.message
    });
  }
};

// Get pet by ID
export const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pet = await Pet.findById(id)
      .populate('owner', 'fullName email');
      
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching pet details',
      error: error.message
    });
  }
};


// Update pet - modified version without admin check
export const modifyPetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Pet updated successfully',
      data: updatedPet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating pet',
      error: error.message
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
        message: 'Pet not found'
      });
    }

    // Check if user is the owner of the pet
    if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own pets'
      });
    }

    // Define significant fields that require re-approval
    const significantFields = ["description", "image", "fee", "species", "breed", "name", "gender", "isTrained"];
    const requiresApproval = significantFields.some(field => 
      updateData[field] !== undefined && updateData[field] !== pet[field]
    );

    // If significant changes are made and not by an admin, reset status to pending
    if (requiresApproval && req.user.role !== 'Admin') {
      updateData.status = 'pending';
      updateData.isApproved = false; // Reset approval status
    }

    // Update the pet
    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({
      success: true,
      message: requiresApproval && req.user.role !== 'Admin' 
        ? 'Pet updated successfully, pending admin approval' 
        : 'Pet updated successfully',
      data: updatedPet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating pet',
      error: error.message
    });
  }
};

// Delete pet
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pet = await Pet.findById(id);
    
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    
    // Vérifie si l'utilisateur est le propriétaire et pas un admin
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own pets' });
    }

    // Suppression si status est "pending" ou "accepted"
    if (pet.status === 'pending' || pet.status === 'accepted') {
      await Pet.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Pet deleted successfully' });
    }

    // Archivage si status est "adopted" ou "sold"
    if (pet.status === 'adopted' || pet.status === 'sold') {
      pet.isArchived = true; // Correction : utilisation de "isArchived"
      await pet.save();
      return res.status(200).json({ success: true, message: 'Pet archived successfully' });
    }

    return res.status(400).json({ success: false, message: 'Invalid action for this pet status' });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error processing request', error: error.message });
  }
};


// Delete pet
export const deleteAdminPet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pet = await Pet.findById(id);
    
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    
    /*  Vérifie si l'utilisateur est un admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }
 */
    // Suppression si status est "pending"
    if (pet.status === 'pending') {
      await Pet.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Pet deleted successfully' });
    }

    // Archivage si status est "adopted" ou "sold"
    if (pet.status === 'adopted' || pet.status === 'sold') {
      pet.isArchived = true; // Correction : utilisation de "isArchived"
      await pet.save();
      return res.status(200).json({ success: true, message: 'Pet archived successfully' });
    }

    // Erreur explicite si status est "accepted"
    if (pet.status === 'accepted') {
      return res.status(403).json({ success: false, message: 'Admin cannot delete an accepted pet' });
    }

    return res.status(400).json({ success: false, message: 'Invalid action for this pet status' });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error processing request', error: error.message });
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
      data: pets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching your pets',
      error: error.message
    });
  }
};

// Apply to adopt a pet 
export const applyToAdopt = async (req, res) => {
  try {
    console.log("Received request:", { params: req.params, body: req.body });

    const { petId } = req.params;
    const userId = req.user?._id; // Vérification sécurisée de req.user
    const { occupation, workSchedule, housing, reasonForAdoption, readiness } = req.body;

    console.log("petId:", petId);
    console.log("userId:", userId);
    console.log("Request body:", { occupation, workSchedule, housing, reasonForAdoption, readiness });

    // Vérifier l'authentification
    if (!userId) {
      console.error("No user ID found in request");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Trouver l'utilisateur connecté
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for ID:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Trouver l'animal
    const pet = await Pet.findById(petId);
    if (!pet) {
      console.error("Pet not found for ID:", petId);
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    // Vérifier le statut de l'animal
    if (pet.status !== "accepted") {
      console.warn("Pet status not accepted:", pet.status);
      return res.status(400).json({
        success: false,
        message: `Pet is not available for adoption (current status: ${pet.status})`
      });
    }

    // Vérifier si owner existe avant toString
    if (!pet.owner) {
      console.error("Pet has no owner:", pet);
      return res.status(400).json({ success: false, message: "Pet has no owner defined" });
    }
    if (pet.owner.toString() === userId.toString()) {
      console.warn("User is the owner of the pet");
      return res.status(400).json({ success: false, message: "You cannot adopt your own pet" });
    }

    // Mettre à jour petOwnerDetails
    user.petOwnerDetails = {
      ...user.petOwnerDetails,
      occupation,
      workSchedule,
      housing: {
        type: housing.type,
        ownership: housing.ownership,
        familySize: housing.familySize,
        landlordApproval: housing.landlordApproval
      },
      reasonForAdoption,
      readiness
    };

    console.log("Updating user with petOwnerDetails:", user.petOwnerDetails);
    await user.save();
    console.log("User saved successfully");

    // Ajouter l'utilisateur à la liste des candidats
    if (!pet.candidates.includes(userId)) {
      pet.candidates.push(userId);
      console.log("Adding user to candidates:", pet.candidates);
      await pet.save();
      console.log("Pet saved successfully");
    }

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      data: {
        pet,
        user: {
          _id: user._id,
          petOwnerDetails: user.petOwnerDetails
        }
      }
    });
  } catch (error) {
    console.error("Error in applyToAdopt:", error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: "Error applying for adoption",
      error: error.message
    });
  }
};
// Admin approve pet listing
export const approvePet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can approve pets'
      });
    }
    
    const pet = await Pet.findById(id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    pet.isApproved = true;
    pet.status = 'available';
    
    await pet.save();
    
    return res.status(200).json({
      success: true,
      message: 'Pet approved successfully',
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error approving pet',
      error: error.message
    });
  }
};

// Get pets by status
export const getPetsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status is one of the enum values
    const validStatuses = ['pending', 'available', 'adopted', 'sold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, available, adopted, sold'
      });
    }
    
    const pets = await Pet.find({ status })
      .populate('owner', 'fullName email');
      
    return res.status(200).json({
      success: true,
      count: pets.length,
      data: pets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching pets by status',
      error: error.message
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
        message: 'Pet not found'
      });
    }
    
    // Check if user is the owner of the pet
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only approve adoptions for your own pets'
      });
    }
    
    // Check if adopter is in candidates list
    if (!pet.candidates.includes(adopterId)) {
      return res.status(400).json({
        success: false,
        message: 'This user has not applied to adopt this pet'
      });
    }
    
    // Update pet status to adopted
    pet.status = 'adopted';
    await pet.save();
    
    return res.status(200).json({
      success: true,
      message: 'Adoption approved successfully',
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error approving adoption',
      error: error.message
    });
  }
};
export const unarchivePet = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Vérifie si l'utilisateur est un admin (si nécessaire)
    // if (req.user.role !== 'Admin') {
    //   return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    // }

    if (!pet.isArchived) {
      return res.status(400).json({ success: false, message: 'Pet is not archived' });
    }

    pet.isArchived = false;
    await pet.save();

    return res.status(200).json({ success: true, message: 'Pet unarchived successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error unarchiving pet',
      error: error.message,
    });
  }
};