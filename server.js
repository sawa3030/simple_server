const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const users = {
    TaroYamada: {
        password: "PaSSwd4TY",
        nickname: "たろー",
        comment: "僕は元気です",
    },
}

app.post('/signup', (req, res) => {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "required user_id and password",
        });
    }

    if (user_id.length < 6 || user_id.length > 20 || password.length < 8 || password.length > 20) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "length of user_id or password does not meet the requirements",
        });
    }

    if (!/^[a-zA-Z0-9]+$/.test(user_id) || !/^[!-~]+$/.test(password)) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "user_id or password does not meet the required pattern",
        });
    }

    if (users[user_id]) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "already same user_id used",
        });
    }

    users[user_id] = {
        password: password,
        nickname: user_id,
    };

    res.status(200).json({        
        message: "Account successfully created",
        user: {
            user_id: user_id,
            nickname: user_id,
        }
    });
});

app.get('/users/:user_id', (req, res) => {
    const { user_id } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Authentication Failed' });
    }

    const encoded = authHeader.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8'); 
    const [authUserId, password] = decoded.split(':');

    const user = users[authUserId];
    if (!user) {
        return res.status(404).json({ message: `No User found` });
    }

    if (password !== user.password) {
        return res.status(401).json({ message: 'Authentication Failed' });
    }

    const responseUser = {
        user_id: authUserId,
        nickname: user.nickname,
    };
    
    if (user.comment && user.comment != null) {
        responseUser.comment = user.comment;
    }
    
    res.status(200).json({
        message: 'User details by user_id',
        user: responseUser,
    });
});

app.patch('/users/:user_id', (req, res) => {
    const { user_id } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Authentication Failed' });
    }

    const encoded = authHeader.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8'); 
    const [authUserId, password] = decoded.split(':');

    const user = users[authUserId];
    if (!user) {
        return res.status(404).json({ message: `No User found` });
    }

    if (user_id !== authUserId) {
        return res.status(403).json({ message: 'No Permission for Update' });
    }

    if (password !== user.password) {
        return res.status(401).json({ message: 'Authentication Failed' });
    }

    const { nickname, comment, requested_user_id, requested_password } = req.body;

    if(!nickname && !comment) {
        return res.status(400).json({ 
            message: "User updation failed",
            cause: "required nickname or comment",
        });
    }

    if (requested_user_id || requested_password) {
        return res.status(403).json({ 
            message: 'User updation failed',
            cause: "not updatable user_id and password",
         });   
    }

    if (nickname.length > 30){
        return res.status(400).json({ 
            message: "User updation failed",
            cause: "length of nickname does not meet the requirements",
        });
    }

    if (comment.length > 100){
        return res.status(400).json({
            message: "User updation failed",
            cause: "length of comment does not meet the requirements",
        });
    }

    if (nickname) {
        user.nickname = nickname === "" ? user.user_id : nickname;
    }

    if (comment) {
        user.commnet = comment === "" ? null : comment;
    }

    res.status(200).json({
        message: 'User successfully updated',
        recipe: {
            nickname: user.nickname,
            comment: user.comment,
        }
    });
});

app.post('/close', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Authentication Failed' });
    }

    const encoded = authHeader.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8'); 
    const [authUserId, password] = decoded.split(':');

    const user = users[authUserId];
    if (!user) {
        return res.status(404).json({ message: `No User found` });
    }

    if (password !== user.password) {
        return res.status(401).json({ message: 'Authentication Failed' });
    }

    delete users[authUserId];

    res.status(200).json({
        message: 'Account and user successfully removed',
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
