const config = require('../config');

module.exports.templateRoutes = (req, res, next) => {
    res.locals.routes = config.routes;

    next();
};

module.exports.csrf = (req, res, next) => {
    res.locals.token = req.csrfToken();
    next();
};

module.exports.authenticated = (req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    if(req.session.isAuthenticated)
        res.locals.user = req.session.user;
    
    next();
};

module.exports.requireAuthentication = (req, res, next) => {
    if(req.session.isAuthenticated){
        next();
    }else {
        res.redirect(config.routes.login);
    }
};

module.exports.auth = (username, password, session) => {
    const isAuth = username === 'test';
    if(isAuth){
        session.isAuthenticated = isAuth;
        session.user = { username };
    }

    return isAuth;
};

module.exports.logOut = session => {
    session.isAuthenticated = false;
    delete session.user;
};