const express = require('express');
const path = require('path');
const partials = require('express-partials');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const csrf = require('csurf');
const flash = require('connect-flash');

const routes = require('./routes');
const errorHandlers = require('./middleware/errorhandlers');
const log = require('./middleware/log');
const util = require('./middleware/utilities');
const config = require('./config');
const io = require('./socket.io');

const app = express();

app.set('view engine', 'ejs');
app.set('view options', { defaultLayout: 'layout' });

app.use(log.logger);
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(cookieParser(config.secret));
app.use(session({ 
    secret: config.secret,
    saveUninitialized: true,
    resave: true,
    store: new RedisStore({host: config.redisHost, port: config.redisPort})
}));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(csrf());
app.use(util.csrf);
app.use(util.authenticated);
app.use(util.templateRoutes);

app.use(partials());
app.get('/', routes.index);
app.get(config.routes.login, routes.login);
app.post(config.routes.login, routes.loginProcess);
app.get(config.routes.logout, routes.logout);
app.get('/chat', [util.requireAuthentication], routes.chat);
app.get('/error', (req, res, next) => {
    // next(new Error('A contrived error'));
})

app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

const server = app.listen(config.port, () => {
    console.log('App server running on port 3000');
});

io.startIo(server);
