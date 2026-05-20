// Verifies the JWT from the Authorization header and attaches the user
// payload to req.user. Use this on every protected route.

const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = verifyToken(token);
    // payload is what we put into signToken() at login time:
    //   { id, username, role, full_name }
    req.user = payload;
    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};
