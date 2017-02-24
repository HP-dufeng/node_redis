const express = require('express');
const path = require('path');
const partials = require('express-partials');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const passport = require('./passport');

const routes = require('./routes');
const errorHandlers = require('./middleware/errorhandlers');
const log = require('./middleware/log');
const util = require('./middleware/utilities');
const config = require('./config');
const io = require('./socket.io');

const app = express();

app.set('view engine', 'ejs');
app.set('view options', { defaultLayout: 'layout' });

app.use(partials());
app.use(log.logger);
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(cookieParser(config.secret));
// Passport does not directly manage your session, it only uses the session.
// So you configure session attributes (e.g. life of your session) via express
app.use(session({ 
    secret: config.secret, 
    saveUninitialized: true, // saved new sessions
    resave: true, // automatically write to the session store
    store: new RedisStore({host: config.redisHost, port: config.redisPort})
}));
app.use(passport.passport.initialize());
app.use(passport.passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(csrf());
app.use(util.csrf);
app.use(util.authenticated);
app.use(flash());
app.use(util.templateRoutes);


app.get('/', routes.index);
app.get(config.routes.login, routes.login);
app.get(config.routes.logout, routes.logout);
app.get(config.routes.register, routes.register);
app.post(config.routes.register, routes.registerProcess);
app.get(config.routes.chat, [util.requireAuthentication], routes.chat);
app.get('/error', (req, res, next) => {
    next(new Error('A contrived error'));
})

passport.routes(app);

app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

const server = app.listen(config.port, () => {
    console.log('App server running on port 3000');
});

io.startIo(server);
