export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({
        error: err.message || "Error inesperado en el servidor"
    });
}

export default errorHandler;
