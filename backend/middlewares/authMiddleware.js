// authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'

// Middleware d'authentification
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

    req.user = user;  
    next();  
  } catch (error) {  
    console.error('Authentication error:', error.message); // Affiche l'erreur  
    res.status(401).json({  
      success: false,  
      message: 'Authentication failed',  
      error: error.message,  
    });  
  }  
};

// Middleware d'autorisation
export const authorize = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({
      success: false,
      message: `Unauthorized: Only ${role}s can access this route`,
    });
  }
  next();
};