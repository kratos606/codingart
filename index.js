const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// initialize the app and set options

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

// connect to MongoDB

mongoose.connect(process.env.MONGO_SECRET_KEY,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        if (err) return console.error(err);
        console.log('Connected to Mongoose');
    }
)

// Routes

const auth = require('./routers/auth');
app.use('/api/auth', auth);
const user = require('./routers/user');
app.use('/api/user', user);
const game = require('./routers/game');
app.use('/api/game', game);
const mail = require('./routers/mail');
app.use('/api/mail', mail);
const solution = require('./routers/solution');
app.use('/api/solution', solution);
app.use('/certificate', express.static(__dirname + '/assets/certificates'));
app.use(express.static('client/build'));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// Running server 

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running');
})