const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require('../middleware');
const User = require('../models/user');


router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            console.log(registeredUser);
            req.flash('success', 'Registered Successfully, Welcome to SnapBlog');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Welcome Back ${req.user.username}`);
    const redirectUrl = res.locals.returnTo || '/'
    res.redirect(redirectUrl);
});

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', storeReturnTo, passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    const githubUsername = req.user.username;
    req.flash('success', `Welcome Back ${githubUsername}.`);
    const redirectUrl = res.locals.returnTo || '/';
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'Goodbye!')
        res.redirect('/')
    })
});



module.exports = router;