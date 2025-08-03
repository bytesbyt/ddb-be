const cors = require('cors');

/*
 CORS Configuration for Express Application
 */

const getAllowedOrigins = () => {
  // Default allowed origins
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  
  // Parse allowed origins from environment variable
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS
      .split(',')
      .map(url => url.trim())
      .filter(url => url); 
  }
  
  return defaultOrigins;
};

const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = getAllowedOrigins();
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // Log blocked attempts for monitoring
      console.warn(`CORS blocked origin: ${origin}`);
      console.info(`Allowed origins: ${allowedOrigins.join(', ')}`);
      
      // In production, return a proper error
      const error = new Error(`Origin ${origin} is not allowed by CORS policy`);
      error.status = 403;
      callback(error);
    }
  },
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Set to 200 for legacy browser support
  optionsSuccessStatus: 200,
  
  // Allow common headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  
  // Expose headers that the browser is allowed to access
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  
  // Cache preflight response for 24 hours
  maxAge: 86400
};

module.exports = {
  corsOptions,
  corsMiddleware: cors(corsOptions),
  getAllowedOrigins
};