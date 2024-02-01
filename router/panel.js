const express = require('express');
const router = express.Router({ mergeParams: true });
const { storeReturnTo, isLoggedIn } = require('../middleware');
const catchAsync = require("../utils/catchAsync");
const formatDate = require("../utils/formatDate");
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const { target } = req.query || 'dashboard';
    const user = await User.findOne({ username: req.user.username });
    const userPosts = await Post.find({ author: user }).populate({ path: 'comments', populate: { path: 'user' } });
    res.render('panel/panel', { target, user, userPosts, formatDate });
}));

router.post('/posts', isLoggedIn, catchAsync(async (req, res) => {
    const { topic, text } = req.body;
    const user = await User.findOne({ username: req.user.username });
    const newPost = new Post({ topic, text, author: user });
    user.posts.push(newPost);
    await newPost.save();
    await user.save()
    res.redirect('/user/panel?target=posts')
}));



router.get('/settings', isLoggedIn, (req, res) => {
    const target = 'settings';
    res.render('panel/panel', { target });
});


router.post('/settings/change-password', isLoggedIn, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Use the authenticate method to check the current password
    req.user.authenticate(currentPassword, (err, user, passwordError) => {
        if (err) {
            req.flash('error', 'An error occurred. Please try again.');
            return res.redirect('/user/panel/setting/change-password');
        }
        if (passwordError) {
            req.flash('error', 'Incorrect current password.');
            return res.redirect('/user/panel/setting/change-password');
        }
        if (user) {
            // If the current password is correct, set the new password
            user.setPassword(newPassword, (err) => {
                if (err) {
                    req.flash('error', 'An error occurred while updating your password. Please try again.');
                    return res.redirect('/user/panel?target=change-password');
                }
                // Save the user with the updated password
                user.save();
                req.flash('success', 'Your password has been updated successfully.');
                res.redirect('/user/panel');
            });
        }
    });
});


module.exports = router;