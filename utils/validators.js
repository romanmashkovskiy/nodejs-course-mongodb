const {body} = require('express-validator');
const User = require('../models/user');

module.exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Incorrect email')
        .custom(async (value) => {
            try {
                const candidate = await User.findOne({email: value});

                if (candidate) {
                    return Promise.reject('E-mail already in use');
                }
                return true;
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password', 'password length min 6 symbols')
        .isLength({min: 6})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords aren\'t equal')
            }
            return true;
        })
        .trim(),
    body('name', 'name length min 3 symbols')
        .isLength({min: 3})
        .trim()
];

module.exports.loginValidators = [
    body('email')
        .isEmail()
        .withMessage('Incorrect email')
        .custom(async (value) => {
            try {
                const candidate = await User.findOne({email: value});

                if (!candidate) {
                    return Promise.reject('E-mail doesn\'t exist');
                }
                return true;
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail()
];

module.exports.courseValidators = [
    body('title')
        .isLength({min: 3})
        .withMessage('title length min 3 symbols')
        .trim(),
    body('price')
        .isNumeric()
        .withMessage('price is not correct'),
    body('img')
        .isURL()
        .withMessage('img url is not correct')
];