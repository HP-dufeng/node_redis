const q = require('q');
const rabbitPromise = require('./rabbit');
const config = require('../config');

const { exchange } = config.rabbitMQ;

const queueSetup = (rabbit) => {    
    rabbit.queue('debug.log', { autoDelete: false }, queue => {
        queue.bind(exchange, '*.log');
        queue.close();
    });

    rabbit.queue('error.log', { autoDelete: false }, queue => {
        queue.bind(exchange, 'error.log');
        queue.close();
    });
};

module.exports = q.Promise((resolve, reject, notify) => {
    rabbitPromise.done(rabbit => {
        rabbit.exchange(exchange, {type: 'topic', autoDelete: false}, ex => {
            queueSetup(rabbit);
            resolve(ex);
        });
    });
});