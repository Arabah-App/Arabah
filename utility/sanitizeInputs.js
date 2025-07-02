const sanitize = require('mongo-sanitize');
// Ensure user input in MongoDB queries is sanitized to avoid NoSQL injection. //
function sanitizeInputs(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitize(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitize(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitize(req.params);
    }
    next();
}

module.exports = sanitizeInputs;
