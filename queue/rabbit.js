const amqp = require('amqp');
const q = require('q');
const config = require('../config');

module.exports = q.Promise((resolve, reject, notify) => {
    const rabbit = amqp.createConnection(config.rabbitMQ.URL);
    rabbit.on('ready', () => {
        resolve(rabbit);
    });
});

