const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/signup', (req, res) => {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "requried user_id and password",
        });
    }

    if (user_id.length < 6 || user_id.length > 20 || password.length < 8 || password.length > 20) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "length of user_id or password does not meet the requirements",
        });
    }

    if (!/^[a-zA-Z0-9]+$/.test(user_id)) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "user_id does not meet the required pattern",
        });
    }

    if (!/^[!-~]+$/.test(password)) {
        return res.status(400).json({ 
            message: "Account creation failed",
            cause: "password does not meet the required pattern",
        });
    }

    res.status(200).json({        
        message: "Account successfully created",
        user: {
            user_id: user_id,
            nickname: user_id,
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
