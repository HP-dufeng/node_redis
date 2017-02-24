const util = require('../middleware/utilities');
const config = require('../config');
const user = require('../passport/user');

const index = (req, res) => {
    res.cookie('IndexCookie', 'This was set from Index.');
    res.render('index', { 
        title: 'Index', 
    });
};

const login = (req, res) => {
    res.render('Login', { title: 'Login', message: req.flash('error') });
};

function register(req, res){
	res.render('register', {title: 'Register', message: req.flash('error')});
};

function registerProcess(req, res){
	if (req.body.username && req.body.password)
	{
		user.addUser(req.body.username, req.body.password, config.crypto.workFactor, function(err, profile){
			if (err) {
				req.flash('error', err);
				res.redirect(config.routes.register);
			}else{
				req.login(profile, function(err){
					res.redirect(config.routes.chat);
				});
			}
		});
	}else{
		req.flash('error', 'Please fill out all the fields');
		res.redirect(config.routes.register);
	}
};

const logout = (req, res) => {
    util.logOut(req);
    res.redirect('/');
};

const chat = (req, res) => {
    res.render('Chat', { title: 'Chat' });
};

module.exports.index = index;
module.exports.login = login;
module.exports.logout = logout;
module.exports.chat = chat;
module.exports.register = register;
module.exports.registerProcess = registerProcess;
