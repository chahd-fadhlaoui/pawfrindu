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

// Get candidates for a specific pet
export const getPetCandidates = async (req, res) => {
  try {
    const { petId } = req.params;
    console.log('Fetching pet with ID:', petId);
    console.time('getPetCandidates');

    const pet = await Pet.findById(petId).populate({
      path: 'candidates.user',
      select: '-password',
    });
    console.log('Pet query completed');
    console.log('Pet found:', pet ? pet._id : 'Not found');
    console.log('Raw pet candidates:', pet ? pet.candidates : 'No pet');

    if (!pet) {
      console.log('Pet not found for ID:', petId);
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    console.log('Candidates raw data:', pet.candidates);
    console.log('Pet owner ID:', pet.owner.toString());
    console.log('Request user ID:', req.user?._id);
    if (!req.user || (pet.owner.toString() !== req.user._id.toString())) {
      console.log('Unauthorized access attempt by:', req.user?._id);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the owner can view candidates',
      });
    }

    const validCandidates = pet.candidates.filter(candidate => {
      if (!candidate.user) {
        console.warn('Invalid candidate found (no user):', candidate);
        return false;
      }
      return true;
    });
    console.log('Valid candidates after filtering:', validCandidates);

    const candidates = validCandidates.map(candidate => {
      const candidateData = {
        id: candidate.user._id,
        name: candidate.user.fullName || "Unknown",
        email: candidate.user.email || "N/A",
        status: candidate.status || "pending",
        petOwnerDetails: {
          occupation: candidate.user.petOwnerDetails?.occupation || "N/A",
          workSchedule: candidate.user.petOwnerDetails?.workSchedule || "N/A",
          housing: {
            type: candidate.user.petOwnerDetails?.housing?.type || "N/A",
            ownership: candidate.user.petOwnerDetails?.housing?.ownership || "N/A",
            familySize: candidate.user.petOwnerDetails?.housing?.familySize || "N/A",
            landlordApproval: candidate.user.petOwnerDetails?.housing?.landlordApproval || false,
          },
          reasonForAdoption: candidate.user.petOwnerDetails?.reasonForAdoption || "N/A",
          readiness: candidate.user.petOwnerDetails?.readiness || "N/A",
          phone: candidate.status === "approved" ? candidate.user.petOwnerDetails?.phone : undefined,
        },
      };
      console.log('Formatted candidate:', candidateData);
      return candidateData;
    });

    console.log('All formatted candidates:', candidates);
    console.timeEnd('getPetCandidates');
    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error("Get Pet Candidates Error:", error.stack);
    console.timeEnd('getPetCandidates');
    return res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message,
    });
  }
};
export const updateCandidateStatus = async (req, res) => {
  try {
    const { petId, candidateId } = req.params;
    const { status } = req.body; // "approved", "rejected", ou "pending"

    console.log('Updating candidate status:', { petId, candidateId, status });

    const pet = await Pet.findById(petId);
    if (!pet) {
      console.log('Pet not found:', petId);
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    console.log('Pet owner:', pet.owner.toString(), 'User:', req.user?._id);
    if (pet.owner.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt by:', req.user?._id);
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const candidateIndex = pet.candidates.findIndex(
      (c) => c.user.toString() === candidateId
    );
    console.log('Candidate index:', candidateIndex);
    if (candidateIndex === -1) {
      console.log('Candidate not found:', candidateId);
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const currentStatus = pet.candidates[candidateIndex].status;
    console.log('Current candidate status:', currentStatus);

    if (status === "approved") {
      const hasApproved = pet.candidates.some(
        (c) => c.status === "approved" && c.user.toString() !== candidateId
      );
      if (hasApproved) {
        console.log('Conflict: Another candidate is already approved');
        return res.status(400).json({
          success: false,
          message: 'Only one candidate can be approved at a time',
        });
      }
      pet.candidates[candidateIndex].status = "approved";
      pet.status = "adoptionPending";
    } else if (status === "rejected") {
      pet.candidates[candidateIndex].status = "rejected";
      if (currentStatus === "approved") {
        const stillApproved = pet.candidates.some(c => c.status === "approved");
        if (!stillApproved && pet.status === "adoptionPending") {
          pet.status = "accepted";
        }
      }
    } else if (status === "pending") {
      pet.candidates[candidateIndex].status = "pending";
      if (currentStatus === "approved") {
        const stillApproved = pet.candidates.some(c => c.status === "approved");
        if (!stillApproved && pet.status === "adoptionPending") {
          pet.status = "accepted";
        }
      }
    } else {
      console.log('Invalid status received:', status);
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pet.save();
    console.log('Candidate updated successfully:', pet.candidates[candidateIndex]);
    return res.status(200).json({
      success: true,
      message: `Candidate updated to ${status} successfully`,
      data: pet,
    });
  } catch (error) {
    console.error("Update Candidate Status Error:", error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error updating candidate status',
      error: error.message,
    });
  }
};

export const finalizeAdoption = async (req, res) => {
  try {
    const { petId, candidateId } = req.params;
    const { action } = req.body; // "adopt" ou "reject"

    console.log('Finalizing adoption:', { petId, candidateId, action });

    const pet = await Pet.findById(petId);
    if (!pet) {
      console.log('Pet not found:', petId);
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    console.log('Pet owner:', pet.owner.toString(), 'User:', req.user?._id);
    if (pet.owner.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt by:', req.user?._id);
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const candidateIndex = pet.candidates.findIndex(
      (c) => c.user.toString() === candidateId && c.status === "approved"
    );
    console.log('Candidate index:', candidateIndex);
    if (candidateIndex === -1) {
      console.log('No approved candidate found for:', candidateId);
      return res.status(400).json({
        success: false,
        message: 'No approved candidate found for this action',
      });
    }

    if (action === "adopt") {
      pet.status = "adopted";
      pet.candidates[candidateIndex].status = "approved"; // Conserver pour historique
      // Rejeter automatiquement les autres candidats
      pet.candidates.forEach((candidate, index) => {
        if (index !== candidateIndex && candidate.status !== "rejected") {
          candidate.status = "rejected";
        }
      });
    } else if (action === "reject") {
      pet.candidates[candidateIndex].status = "rejected";
      const stillApproved = pet.candidates.some(c => c.status === "approved");
      pet.status = stillApproved ? "adoptionPending" : "accepted";
    } else {
      console.log('Invalid action received:', action);
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await pet.save();
    console.log('Adoption finalized:', { petStatus: pet.status, candidateStatus: pet.candidates[candidateIndex].status });
    return res.status(200).json({
      success: true,
      message: `Adoption ${action === "adopt" ? "finalized" : "rejected"} successfully`,
      data: pet,
    });
  } catch (error) {
    console.error("Finalize Adoption Error:", error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error finalizing adoption',
      error: error.message,
    });
  }
};