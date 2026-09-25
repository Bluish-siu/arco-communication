import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    } else if (parts.length === 1 && parts[0]) {
      token = parts[0];
    }
  }

  // Fallback to query parameter only if explicitly present
  if (!token && req.query?.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication token is required',
    });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: err.name === 'TokenExpiredError'
          ? 'Unauthorized: Authentication token has expired'
          : 'Unauthorized: Invalid authentication token',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication failed',
      });
    }

    req.user = user;
    next();
  });
};

export { requireRole, requireAdmin, requireManagerOrAdmin } from './rbac.js';
