import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const authenticate = async (req, res, next) => {  
  try {  
    const token = req.header('Authorization')?.replace('Bearer ', '');  

    if (!token) {  
      throw new Error('Authentication required');  
    }  

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);  

    const user = await User.findById(decoded.userId);  
    if (!user) {  
      throw new Error('User not found');  
    }  

    // Ajouter une valeur par défaut pour adminType si absent pour les admins
    if (user.role === "Admin" && !user.adminType) {
      user.adminType = "Super Admin"; // Valeur par défaut temporaire
    }

    req.user = user;  
    next();  
  } catch (error) {  
    console.error('Authentication error:', error.message);
    res.status(401).json({  
      success: false,  
      message: 'Authentication failed',  
      error: error.message,  
    });  
  }  
};

export const authorize = (...allowedRoles) => (req, res, next) => {
  // If Admin is allowed, also allow SuperAdmin
  const effectiveRoles = allowedRoles.includes('Admin')
    ? [...allowedRoles, 'SuperAdmin']
    : allowedRoles;

  if (!effectiveRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Unauthorized: Only ${effectiveRoles.join(' or ')} can access this route`,
    });
  }
  next();
};

// Nouveau middleware pour adminType (facultatif, mais utile)
export const authorizeAdminType = (...allowedAdminTypes) => (req, res, next) => {
  if (req.user.role !== "Admin" || !allowedAdminTypes.includes(req.user.adminType)) {
    return res.status(403).json({
      success: false,
      message: `Unauthorized: Only ${allowedAdminTypes.join(' or ')} can access this route`,
    });
  }
  next();
};