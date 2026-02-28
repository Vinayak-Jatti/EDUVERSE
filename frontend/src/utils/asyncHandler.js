/**
 * Wraps an async controller function and forwards any error
 * to Express's next() — so the global error handler catches it.
 *
 * Without this you'd need try/catch in every single controller.
 *
 * @example
 *   export const getUser = asyncHandler(async (req, res) => {
 *     const user = await userService.findById(req.params.id);
 *     return sendSuccess(res, req, { data: user });
 *   });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
