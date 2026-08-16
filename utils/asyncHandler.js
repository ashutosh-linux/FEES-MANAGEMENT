/**
 * asyncHandler
 *
 * Wraps an async Express route handler and forwards any rejected promise
 * to `next(err)` — eliminating boilerplate try/catch in every controller.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
