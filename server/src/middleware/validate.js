const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[source]);
      if (!parsed.success) {
        const errors = parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: errors[0]?.message || 'Validation error',
          errors,
        });
      }
      req[source] = parsed.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { validate };
