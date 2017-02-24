const passport = require('passport');
const facebook = require('passport-facebook').Strategy;
const google = require('passport-google-oauth').OAuth2Strategy;
const local = require('passport-local').Strategy;
const config = require('../config');
const user = require('./user');
const passwordUtils = require('./password');

passport.use(
    new facebook(
        {
            clientID: config.facebook.appID,
            clientSecret: config.facebook.appSecret,
            callbackURL: config.host + config.routes.facebookAuthCallback   
        },
        (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }
    )
);

passport.use(
    new google(
        {
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.host + config.routes.googleAuthCallback
        },
        (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }
    )
);

passport.use(new local(function(username, password, done){
    user.findByUsername(username, function(err, profile){
        if(profile) {
            passwordUtils.passwordCheck(password, profile.password, profile.salt,
                profile.work, function(err,isAuth){
                if(isAuth) {
                    if (profile.work < config.crypto.workFactor) {
                        user.updatePassword(username, password,
                        config.crypto.workFactor);
                    }
                    done(null, profile);
                } else {
                    done(null, false, {message: 'Wrong Username or Password'});
                }
            });
        } else {
            done(null, false, {message: 'Wrong Username or Password'});
        }
    });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
})

const routes = app => {
    app.get(config.routes.facebookAuth, passport.authenticate('facebook'));
    app.get(config.routes.facebookAuthCallback, passport.authenticate('facebook', {
        successRedirect: config.routes.chat, 
        failureRedirect: config.routes.login, 
        failureFlash: true
    }));

    app.get(config.routes.googleAuth, passport.authenticate('google',{ 
        scope:['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] 
    }));
    app.get(config.routes.googleAuthCallback, passport.authenticate('google',{
        successRedirect: config.routes.chat, 
        failureRedirect: config.routes.login, failureFlash: true
    }));

    app.post(config.routes.login, passport.authenticate('local',{
        successRedirect: '/chat', 
        failureRedirect: config.routes.login,
        failureFlash: true
    }));
};

exports.passport = passport;
exports.routes = routes;