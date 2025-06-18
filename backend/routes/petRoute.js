import express from 'express';
import {
  applyToAdopt,
  approveAdoption,
  archivePet,
  createPet,
  deleteAdminPet,
  deletePet,
  finalizeAdoption,
  getAllPets,
  getMyAdoptedPets,
  getMyAdoptionRequests,
  getMyPets,
  getPetById,
  getPetCandidates,
  getPetStats,
  modifyPetStatus,
  sendRejectionEmail,
  unarchivePet,
  updateCandidateStatus,
  updatePet
} from '../controllers/petController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
const petRouter = express.Router();

// Routes publiques
petRouter.get('/allpets', getAllPets);  // Récupérer tous les pets
petRouter.get('/pets/:id', getPetById);  // Récupérer un pet par ID
petRouter.put('/modifyStatus/:id', modifyPetStatus);  // Récupérer un pet par ID
petRouter.delete('/deleteAdminPet/:id', deleteAdminPet);  // Supprimer un pet
petRouter.put('/unarchivePet/:id',unarchivePet); 



// Routes protégées (authentification requise)
petRouter.use(authenticate);  // Appliquer le middleware d'authentification à toutes les routes suivantes

// Routes pour les pet owners 
petRouter.post('/addpet', createPet);  // Vérifier que l'utilisateur est un PetOwner avant de créer un pet
petRouter.get('/mypets', getMyPets);  // Récupérer les pets de l'utilisateur connecté
petRouter.put('/updatedPet/:id', updatePet);  // Mettre à jour un pet
petRouter.delete("/deletePet/:id", deletePet);// Supprimer un pet
petRouter.get('/:petId/candidates', getPetCandidates); // Nouvelle route pour les candidats
petRouter.put('/:petId/candidate/:candidateId/status', updateCandidateStatus);  // Mettre à jour le statut d'un candidat
petRouter.put('/:petId/candidate/:candidateId/finalize', finalizeAdoption);   // Finaliser l'adoption d'un pet
petRouter.put('/archivePet/:id', archivePet);  // Archiver un pet (pet owners et admins)

petRouter.post('/:petId/apply', applyToAdopt);  // Postuler pour adopter un pet
 
petRouter.post('/:petId/approve-adoption/:adopterId', approveAdoption);  // Approuver une adoption

petRouter.get("/my-adoption-requests", getMyAdoptionRequests); // Adoption requests for Adopters 
petRouter.get("/my-adopted-pets", getMyAdoptedPets); 
// Routes pour l'admin
petRouter.use(authorize(['Admin', 'SuperAdmin']));  // Appliquer le middleware d'autorisation pour les routes suivantes
petRouter.put('/modifyStatus/:id', modifyPetStatus);  // Récupérer un pet par ID
petRouter.delete('/deleteAdminPet/:id', deleteAdminPet);  // Supprimer un pet

petRouter.put('/unarchivePet/:id',unarchivePet); 
petRouter.get("/stats", getPetStats);
petRouter.post("/send-rejection-email", authenticate, authorize("Admin"), sendRejectionEmail);


export default petRouter;
