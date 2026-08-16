import { validationResult } from "express-validator";

/**
 * validate
 *
 * Runs an array of express-validator chain rules, then checks the result.
 * Returns 422 with a structured errors array if anything fails.
 * Must be placed AFTER the rule chains in the route definition:
 *
 *   router.post("/", studentRules, validate, createStudent);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).json({
    success : false,
    message : "Validation failed",
    errors  : errors.array().map((e) => ({
      field   : e.path,
      message : e.msg,
      value   : e.value,
    })),
  });
};

export default validate;
