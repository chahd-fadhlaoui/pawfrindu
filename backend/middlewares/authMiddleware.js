// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

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
    console.error('Authentication error:', error.message);
    res.status(401).json({  
      success: false,  
      message: 'Authentication failed',  
      error: error.message,  
    });  
  }  
};

// Middleware d'autorisation (supports multiple roles)
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Unauthorized: Only ${allowedRoles.join(' or ')} can access this route`,
    });
  }
  next();
};