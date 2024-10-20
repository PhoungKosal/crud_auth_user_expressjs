const notFound = (req, res, next ) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
    res.status(404)
    next(error);
}

// error handlers
const errorHandler = (err, req, res, next) => {
    const stautsCode = res.stautsCode ? res.stautsCode : 400

    res.status(stautsCode)

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? null : err.stack
    })
}


module.exports = {
    notFound,
    errorHandler,
};
