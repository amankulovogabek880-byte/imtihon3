export const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (req.headers.accept) {
    return res.status(err.status || 500).render("error", {
      message: err.message || "Server error"
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error"
  });
};