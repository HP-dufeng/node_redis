const index = (req, res) => {
    res.send('Index');
};

const login = (req, res) => {
    res.send('Login');
};

const loginProcess = (req, res) => {
    res.send('/');
};

const chat = (req, res) => {
    res.send('Chat');
};

module.exports.index = index;
module.exports.login = login;
module.exports.loginProcess = loginProcess;
module.exports.chat = chat;
