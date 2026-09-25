/**
 * Role-Based Access Control (RBAC) Middleware for ARCO Communication
 *
 * Supported Roles:
 * - 'admin': Full access to all business operations, team management, integrations, and destructive actions.
 * - 'manager': Marketing campaigns, templates, segment management, supervisory inbox access, and customer updates.
 * - 'agent': Assigned conversation handling, contact viewing/updating, and assigned task updates.
 */

/**
 * Creates middleware requiring the authenticated user to possess at least one of the specified roles.
 *
 * @param  {...string} allowedRoles
 * @returns {Function} Express middleware
 */
export const requireRole = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
      });
    }

    const userRole = (req.user.role || 'agent').toLowerCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Action requires ${allowedRoles.join(' or ')} privileges`,
      });
    }

    next();
  };
};

// Common role-guard presets
export const requireAdmin = requireRole('admin');
export const requireManagerOrAdmin = requireRole('admin', 'manager');
export const requireAgentOrHigher = requireRole('admin', 'manager', 'agent');
