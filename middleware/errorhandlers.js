const log = require('../middleware/log');

exports.notFound = (req, res, next) => {
    res.status(404).send('You seem lost. You must have taken a wrong turn back.');
};

exports.error = (err, req, res, next) => {
    log.error({ error: err.message, ts: Date.now() });
    res.status(500).send('Something broke, What did you do?');
};