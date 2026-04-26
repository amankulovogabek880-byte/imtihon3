export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      if (req.headers.accept) {
        return res.redirect("back");
      }
      return res.status(400).json({ success: false, message:error });
    }

    next();
  };
};
