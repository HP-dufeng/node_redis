const exchange = require('../queue');

const debug = message => {
    exchange.done(ex => {
        ex.publish('debug.log', message);
    })
};

const error = message => {
    exchange.done(ex => {
        ex.publish('error.log', message);
    });
}

exports.logger  = (req, res, next) => {
    debug({ url: req.url, ts: Date.now() });

    next();
};

exports.debug = debug;
exports.error = error;