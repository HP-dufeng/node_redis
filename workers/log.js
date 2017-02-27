const rabbitPromise = require('../queue/rabbit');
const config = require('../config');

rabbitPromise.done(rabbit => {
    rabbit.queue('debug.log', { autoDelete: false }, q => {
        q.bind(config.rabbitMQ.exchange, '*.log');
        q.subscribe({ ack: true, prefetchCount: 1 }, (message, headers, delivery, messageObject) => {
            console.log('Debug-Routing:' + delivery.routingKey + JSON.stringify(message));
            messageObject.acknowledge();
            //setTimeout(function(){messageObject.reject(true);}, 2000);
        });
    });

    rabbit.queue('error.log', {autoDelete: false}, (q) => {
        q.bind(config.rabbitMQ.exchange, 'error.log');
        q.subscribe({ ack: true, prefetchCount: 1 }, (message, headers, delivery, messageObject) => {
            console.log('Error-Routing:' + delivery.routingKey + JSON.stringify(message));
            messageObject.acknowledge();
        });
    });
});