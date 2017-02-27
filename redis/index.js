const redis = require('redis');
const config = require('../config');

const client = redis.createClient(config.redisPort, config.redisHost);

exports.client = client;
