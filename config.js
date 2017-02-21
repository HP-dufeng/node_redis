const config = {
    port: 3000,
    secret: 'my secret',
    redisUrl: 'redis://localhost',
    routes: {
        login: '/login',
        logout: '/logout'
    }
};

module.exports = config;