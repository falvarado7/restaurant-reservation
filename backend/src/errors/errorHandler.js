/**
 * Express API error handler.
 */
function errorHandler(error, _req, res, _next) {
    const { status = 500, message = "Something went wrong!" } = error || {};
    console.error(error); // keep this for console
    res.status(status).json({ error: message });
}

module.exports = errorHandler;
