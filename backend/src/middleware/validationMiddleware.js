const ApiError = require('../utils/ApiError');

// Validates req[source] with a zod schema. Parsed (typed, trimmed, unknown-keys-stripped) data
// is placed in req.validated[source]; controllers must read from there, never from raw input.
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] === undefined ? {} : req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
    return next(new ApiError(422, errors[0] ? errors[0].message : 'Validation failed', errors));
  }
  req.validated = req.validated || {};
  req.validated[source] = result.data;
  return next();
};

const validateObjectId = (...params) => (req, res, next) => {
  for (const name of params) {
    if (!/^[a-f\d]{24}$/i.test(String(req.params[name] || ''))) {
      return next(new ApiError(400, `Invalid ${name}`));
    }
  }
  return next();
};

module.exports = { validate, validateObjectId };
