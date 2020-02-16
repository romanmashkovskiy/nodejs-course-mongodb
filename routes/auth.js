const {Router} = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
// const sendGrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const {validationResult} = require('express-validator');

const User = require('../models/user');
const env = require('../config/env');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const {registerValidators, loginValidators} = require('../utils/validators');

// const transporter = nodemailer.createTransport(sendGrid({
//     auth: {
//         api_key: env.SENDGRID_API_KEY
//     }
// }));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_FROM,
        pass: env.EMAIL_PASSWORD
    }
});

const router = Router();

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError')
    });
});

router.post('/login', loginValidators, async (req, res) => {
    try {
        const {email, password} = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#login');
        }

        const candidate = await User.findOne({email});

        const areSame = await bcrypt.compare(password, candidate.password);

        if (areSame) {
            req.session.user = candidate;
            req.session.isAuthenticated = true;

            req.session.save((err) => {
                if (err) {
                    throw err;
                }
                res.redirect('/');
            })
        } else {
            req.flash('loginError', 'password incorrect');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            throw err;
        }
        res.redirect('/auth/login#login');
    });
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({email, password: hashPassword, name, card: {items: []}});
        await user.save();
        res.redirect('/auth/login#login');
    } catch (e) {
        console.log(e);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Reset password',
        error: req.flash('error')
    });
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'some error occurred');
                return res.redirect('/auth/reset');
            }
            const token = buffer.toString('hex');

            const {email} = req.body;

            const candidate = await User.findOne({email});

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                await transporter.sendMail(resetEmail(candidate.email, token));
                res.redirect('/auth/login#login');
            } else {
                req.flash('error', 'user doesn\'t exist');
                res.redirect('/auth/reset');
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login#login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            return res.redirect('/auth/login#login');
        } else {
            res.render('auth/password', {
                title: 'Provide new password',
                error: req.flash('error'),
                userId: user.id,
                token: req.params.token
            });
        }
    } catch (e) {
        console.log(e);
    }
});

router.post('/password', async (req, res) => {
    try {
        const {userId, token, password} = req.body;

        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            req.flash('loginError', 'token is expired');
            res.redirect('/auth/login#login');
        } else {
            user.password = await bcrypt.hash(password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;