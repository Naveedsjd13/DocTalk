const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
