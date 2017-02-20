const util = require('../middleware/utilities');

const index = (req, res) => {
    res.cookie('IndexCookie', 'This was set from Index.');
    res.render('index', { 
        title: 'Index', 
    });
};

const login = (req, res) => {
    res.render('Login', { title: 'Login', message: req.flash('error') });
};

const loginProcess = (req, res) => {
    const isAuth = util.auth(req.body.username, req.body.password, req.session);
    if(isAuth){
        res.redirect('/chat');
    } else {
        req.flash('error', 'Wrong username or password.');
        res.redirect('/login');
    }
};

const logout = (req, res) => {
    util.logOut(req.session);
    res.redirect('/');
};

const chat = (req, res) => {
    res.render('Chat', { title: 'Chat' });
};

module.exports.index = index;
module.exports.login = login;
module.exports.logout = logout;
module.exports.loginProcess = loginProcess;
module.exports.chat = chat;
