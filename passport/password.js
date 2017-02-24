const crypto = require('crypto');
const scmp = require('scmp');
const Buffer = require('safe-buffer').Buffer;
const config = require('../config');

var passwordCreate = (password, cb) => {
    crypto.randomBytes(config.crypto.randomSize, (err, salt) => {
        if (err)
            return cb(err, null);

        crypto.pbkdf2(
            password, 
            salt.toString('base64'),
            config.crypto.workFactor, 
            config.crypto.keylen, 
            'sha512',
            (err, key) => {
                cb(null, salt.toString('base64'), key.toString('base64'));
            });
    });
};

var passwordCheck = (password, derivedPassword, salt, work, cb) => {
    crypto.pbkdf2(
        password, 
        salt, 
        work, 
        config.crypto.keylen, 
        'sha512',
        (err, key) => {
            cb(null, scmp(
                Buffer.from(key.toString('base64'),'utf8'), 
                Buffer.from(derivedPassword, 'utf8')
            ));
        }
    );
};

exports.passwordCreate = passwordCreate;
exports.passwordCheck = passwordCheck;