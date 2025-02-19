import express from 'express';
import {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet,
  getMyPets,
  applyToAdopt,
  approvePet,
  getPetsByStatus,
  approveAdoption,
} from '../controllers/petController.js'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'

const petRouter = express.Router();

// Routes publiques
petRouter.get('/allpets', getAllPets);  // Récupérer tous les pets
petRouter.get('/pets/:id', getPetById);  // Récupérer un pet par ID

// Routes protégées (authentification requise)
petRouter.use(authenticate);  // Appliquer le middleware d'authentification à toutes les routes suivantes

// Routes pour les pet owners 
petRouter.post('/addpet', authorize('PetOwner'), createPet);  // Vérifier que l'utilisateur est un PetOwner avant de créer un pet
petRouter.get('/pets', getMyPets);  // Récupérer les pets de l'utilisateur connecté
petRouter.put('/pets/:id', updatePet);  // Mettre à jour un pet
petRouter.delete('/pets/:id', deletePet);  // Supprimer un pet
petRouter.post('/pets/:petId/apply', applyToAdopt);  // Postuler pour adopter un pet
petRouter.post('/pets/:petId/approve-adoption/:adopterId', approveAdoption);  // Approuver une adoption

// Routes pour l'admin
petRouter.use(authorize('Admin'));  // Appliquer le middleware d'autorisation pour les routes suivantes
petRouter.patch('/pets/:id/approve', approvePet);  // Approuver un pet (admin)
petRouter.get('/pets/status/:status', getPetsByStatus);  // Récupérer les pets par statut

export default petRouter;
