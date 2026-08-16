/**
 * Standardized API response helpers.
 *
 * Every endpoint returns the same JSON envelope:
 * {
 *   success : boolean,
 *   message : string,
 *   data    : any | null,
 *   meta    : object | null   (pagination, counts, etc.)
 * }
 */

export const sendSuccess = (res, { statusCode = 200, message = "Success", data = null, meta = null } = {}) => {
  const payload = { success: true, message };
  if (data !== null)  payload.data = data;
  if (meta !== null)  payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendError = (res, { statusCode = 500, message = "An error occurred", errors = null } = {}) => {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

/**
 * Convenience: 404 Not Found
 */
export const sendNotFound = (res, resource = "Resource") =>
  sendError(res, { statusCode: 404, message: `${resource} not found` });
