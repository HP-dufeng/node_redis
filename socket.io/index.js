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
            socket.request.user = session.passport.user;
			socket.request.sid = sid;
			redisChat.addUser(session.passport.user.id, session.passport.user.displayName, session.passport.user.provider);
			
            return next();
        } else {
            return next(new Error('Not Authenticated'));
        }
    });
};

const removeFromRoom = (socket, room) => {
	socket.leave(room);
	redisChat.removeUserFromRoom(socket.request.user.id, room);
	socket.broadcast.to(room).emit('RemoveUser',
		models.User(socket.request.user.id, socket.request.user.displayName, socket.request.user.provider));
};

const removeAllRooms = (socket, cb) => {
	const current = socket.rooms;
	const len = Object.keys(current).length;
	let i = 0;
	for(var r in current)
	{
		if (current[r] !== socket.id)
		{
			removeFromRoom(socket, current[r]);
		}
		i++;
		if (i === len) cb();

	}
};


const socketConnection = socket => {
    socket.on('GetMe', () => {
        const { id, diaplayName, provider } = socket.request.user;
        socket.emit('GetMe', models.User(id, displayName, provider));
    });
    
    socket.on('GetUser', function(room){
		var  usersP = redisChat.getUsersinRoom(room.room);
		usersP.done(function(users){
			socket.emit('GetUser', users);
		});
	});

	socket.on('GetChat', function(data){
		redisChat.getChat(data.room, function(chats){
			var retArray = [];
			var len = chats.length;
			chats.forEach(function(c){
				try{
					retArray.push(JSON.parse(c));
				}catch(e){
					log.error(e.message);
				}
				len--;
				if (len === 0) socket.emit('GetChat', retArray);
			});
		});
	});

	socket.on('AddChat', function(chat){
		var newChat = models.Chat(chat.message, chat.room,
			models.User(socket.request.user.id, socket.request.user.displayName, socket.request.user.provider));
		redisChat.addChat(newChat);
		socket.broadcast.to(chat.room).emit('AddChat', newChat);
		socket.emit('AddChat', newChat);
	});

	socket.on('GetRoom', function(){
		redisChat.getRooms(function(rooms){
			var retArray = [];
			var len = rooms.length;
			rooms.forEach(function(r){
				retArray.push(models.Room(r));
				len--;
				if(len === 0) socket.emit('GetRoom', retArray);
			});
		});
	});

	socket.on('AddRoom', function(r){
		var room = r.name;
		removeAllRooms(socket, function(){
			if (room !== '')
			{
				socket.join(room);
				redisChat.addRoom(room);
				socket.broadcast.emit('AddRoom', models.Room(room));
				socket.broadcast.to(room).emit('AddUser',
					models.User(socket.request.user.id, socket.request.user.displayName, socket.request.user.provider));
				redisChat.addUserToRoom(socket.request.user.id, room);
			}
		});
	});

	socket.on('disconnect', function(){
        removeAllRooms(socket, function(){});
	});
};

exports.startIo = server => {
    const ios = io.listen(server);
    ios.adapter(redisAdapter({host: config.redisHost, port: config.redisPort }));
    
    const packtchat = ios.of('/packtchat');

    packtchat.use(socketAuth);
    packtchat.on('connection', socketConnection);

    return ios;
};