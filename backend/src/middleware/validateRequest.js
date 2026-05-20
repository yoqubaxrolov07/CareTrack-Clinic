// Bridges express-validator with our ApiError so validation failures
// produce a consistent JSON response.

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

module.exports = function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map(e => ({
    field:   e.path,
    message: e.msg,
  }));
  return next(ApiError.badRequest('Validation failed', details));
};
