// Role-based access control.
//
// Usage:
//   router.post('/', authMiddleware, requireRole('admin'), controller);
//   router.put ('/', authMiddleware, requireRole('admin', 'clinician'), controller);
//
// Permissions matrix (from the assignment brief):
//   admin        -> everything
//   clinician    -> view + update Patients and Diagnoses
//   receptionist -> create Patients, view Doctors

const ApiError = require('../utils/ApiError');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      ));
    }
    next();
  };
}

module.exports = { requireRole };
