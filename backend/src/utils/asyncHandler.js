// Wraps an async controller so any thrown / rejected error is forwarded
// to Express's error middleware. Lets us write controllers without a
// try/catch around every single one.
//
//   router.get('/x', asyncHandler(async (req, res) => { ... }));

module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
