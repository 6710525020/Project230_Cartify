const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'changeme';

/**
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches decoded payload to req.user
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
}

/** Restrict to specific roles: e.g. requireRole('admin') */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

/** Allow if requester owns the resource or has one of the allowed roles */
function requireSelfOrRole(paramName = 'id', ...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.includes(req.user.role)) return next();
    if (String(req.user.id) === String(req.params[paramName])) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { authenticate, requireRole, requireSelfOrRole };
