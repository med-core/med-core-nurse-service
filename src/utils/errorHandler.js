export const sendError = (err, res) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  console.error(`[${new Date().toISOString()}] Error ${status}:`, message);

  res.status(status).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};