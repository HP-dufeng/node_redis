const config = {
    port: 3000,
    secret: 'my secret',
    redisPort: 6379,
    redisHost: 'localhost',
    routes: {
        login: '/account/login',
        logout: '/account/logout',
        register: '/account/register',
        chat: '/chat',
        facebookAuth: '/auth/facebook',
        facebookAuthCallback: '/auth/facebook/callback',
        googleAuth: '/auth/google',
        googleAuthCallback: '/auth/google/callback'
    },
    host: 'http://localhost:3000',
    facebook: {
        appID: '767025650130078',
        appSecret: 'b7de15bf09fa25136b02cc0498000b3e'
    },
    google: {
        clientID: '895031422365-f7idgp503d77n4b65jrs4jbru0mnr17j.apps.googleusercontent.com',
        clientSecret: 'tZzrwHhyXCLq-gN4WxThWzv5'
    },
    crypto: {
        workFactor: 50000,
        keylen: 32,
        randomSize: 256
    }
};

module.exports = config;