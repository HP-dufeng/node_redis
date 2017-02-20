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

const app = express();

app.set('view engine', 'ejs');
app.set('view options', { defaultLayout: 'layout' });

app.use(log.logger);
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(cookieParser('secret string'));
app.use(session({ 
    secret: 'secret string',
    saveUninitialized: true,
    resave: true,
    store: new RedisStore({url: 'redis://localhost'})
}));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(csrf());
app.use(util.csrf);
app.use(util.authenticated);
app.use(partials());

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.loginProcess);
app.get('/logout', routes.logout);
app.get('/chat', [util.requireAuthentication], routes.chat);
app.get('/error', (req, res, next) => {
    // next(new Error('A contrived error'));
})

app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

app.listen(3000, () => {
    console.log('App server running on port 3000');
});
