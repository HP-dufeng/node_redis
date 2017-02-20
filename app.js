const express = require('express');
const path = require('path');
const routes = require('./routes');
const errorHandlers = require('./middleware/errorhandlers');
const log = require('./middleware/log');

const app = express();
app.use(log.logger);
app.use(express.static(path.resolve(__dirname, 'static')));

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.loginProcess);
app.get('/chat', routes.chat);
app.get('/error', (req, res, next) => {
    // next(new Error('A contrived error'));
})

app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

app.listen(3000, () => {
    console.log('App server running on port 3000');
});
