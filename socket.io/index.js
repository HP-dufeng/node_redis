const io = require('socket.io');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const ConnectRedis = require('connect-redis')(expressSession);
const redisAdapter = require('socket.io-redis');
const config = require('../config');

const redisSession = new ConnectRedis({host: config.redisHost, port: config.redisPort});
const redisChat = require('../redis/chat');
const models = require('../redis/models');
const log = require('../middleware/log');


const socketAuth = (socket, next) => {
    const handshakeData = socket.request;
    const parsedCookie = cookie.parse(handshakeData.headers.cookie);
    const sid = cookieParser.signedCookie(parsedCookie['connect.sid'], config.secret);

    if(parsedCookie['connect.sid'] === sid)
        return next(new Error('Not Authenticated'));

    redisSession.get(sid, (err, session) => {
        if(session.isAuthenticated){
            socket.user = session.user;
            socket.sid = sid;
            return next();
        } else {
            return next(new Error('Not Authenticated'));
        }
    });
};

const socketConnection = socket => {
    socket.on('GetMe', function(){});
    socket.on('GetUser', function(room){});
    socket.on('GetChat', function(data){});
    socket.on('AddChat', function(chat){});
    socket.on('GetRoom', function(){});
    socket.on('AddRoom', function(r){});
    socket.on('disconnect', function(){});
};

exports.startIo = server => {
    const ios = io.listen(server);
    ios.adapter(redisAdapter({host: config.redisHost, port: config.redisPort }));
    
    const packtchat = ios.of('/packtchat');

    packtchat.use(socketAuth);
    packtchat.on('connection', socketConnection);

    return ios;
};