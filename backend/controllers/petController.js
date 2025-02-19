import Pet from '../models/petModel.js'

// Create a new pet
export const createPet = async (req, res) => {
  try {
    const { 
      name, race, breed, age, city, gender, 
      category, fee, isTrained, image, description 
    } = req.body;
    
    // Get owner ID from authenticated user
    const ownerId = req.user._id;
    
    // Create new pet
    const newPet = new Pet({
      name,
      race,
      breed,
      age,
      city,
      gender,
      category,
      fee,
      isTrained,
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
      
    return res.status(200).json({
      success: true,
      count: pets.length,
      data: pets
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

// Update pet
export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find pet first to check ownership
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
    
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
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

// Delete pet
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find pet first to check ownership
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
        message: 'Unauthorized: You can only delete your own pets'
      });
    }
    
    await Pet.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting pet',
      error: error.message
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

// Apply to adopt a pet (simple version)
export const applyToAdopt = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user._id;
    
    const pet = await Pet.findById(petId);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Check if pet is available
    if (pet.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Pet is not available for adoption (current status: ${pet.status})`
      });
    }
    
    // Check if user is the owner
    if (pet.owner.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot adopt your own pet'
      });
    }
    
    // Add user to candidates if not already there
    if (!pet.candidates.includes(userId)) {
      pet.candidates.push(userId);
      await pet.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error applying for adoption',
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