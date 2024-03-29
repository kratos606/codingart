const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const { promisify } = require('util');

// Login Validation

const loginValidation = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
});

// Login Controller

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.json({ error: "You must fill all required fields" });
        const { error } = loginValidation.validate(req.body);
        if (error) return res.json({ error: error.details[0].message });
        const user = await User.findOne({ email });
        if (!user || !(await user.verifyPassword(req.body.password, user.password))) return res.json({ error: "Incorrect email or password" });
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JSON_WEB_TOKEN_SECRET_KEY);
        const currentUser = { ...user._doc, password: undefined }
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        }).send(currentUser);
    }
    catch (err) {
        res.send({ error: err.message });
    }
}

// register validation

const registerValidation = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required()
});

// register route

const registerController = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.json({ error: "You must fill all required fields" })
        }
        const { error } = registerValidation.validate(req.body);
        if (error) return res.json({ error: error.details[0].message });
        const emailExist = await User.findOne({ email: req.body.email });
        if (emailExist) return res.json({ error: "Email already exists" });
        const usernameExist = await User.findOne({ username: req.body.username });
        if (usernameExist) return res.json({ error: "Username already exists" });
        const salt = await bcrypt.genSalt(10);
        let cryptedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: cryptedPassword
        });
        const savedUser = await user.save();
        const token = jwt.sign({ id: savedUser._id, isAdmin: savedUser.isAdmin }, process.env.JSON_WEB_TOKEN_SECRET_KEY);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        }).send();
    } catch (err) {
        res.send({ error: err.message });
    }
}

// Check if the user is authenticated

const checkController = async (req, res) => {
    let currentUser;
    if (req.cookies.token) {
        const token = req.cookies.token;
        const decoded = await promisify(jwt.verify)(token, process.env.JSON_WEB_TOKEN_SECRET_KEY);
        currentUser = await User.findById(decoded.id, "-password");
    } else {
        currentUser = null;
    }
    res.send({ currentUser });
}

// Logout Controller

const logoutController = async (req, res) => {
    res
        .cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: true,
            sameSite: "none",
        })
        .send();
}

module.exports = { loginController, registerController, checkController, logoutController };