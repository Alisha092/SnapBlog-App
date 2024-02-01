const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require('../middleware');
const catchAsync = require("../utils/catchAsync");
const formatDate = require("../utils/formatDate");
const Post = require('../models/post');

const trimText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
}

router.get('/', catchAsync(async (req, res) => {
    const posts = await Post.find({}).populate('author');
    res.render('posts', { posts, trimText })
}));



router.get('/:postId', catchAsync(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate('author').populate({ path: 'comments', populate: { path: 'user', model: 'User' } })
    if (!post) {
        // Handle the case where the post is not found
        res.status(404).send('Post not found');
        return;
    }
    if (!req.session.viewedPosts) {
        req.session.viewedPosts = [];
    }
    if (!req.session.viewedPosts.includes(postId)) {
        req.session.viewedPosts.push(postId);
        await post.increseView();
    }
    res.render('post/post', { post, formatDate });
}));

router.post('/:postId/comment', isLoggedIn, catchAsync(async (req, res) => {
    const { postId } = req.params;
    const { username } = req.user
    const { text } = req.body.comment;
    const post = await Post.findById(postId)
    await post.addComment(username, text)
    res.redirect(`/posts/${postId}`);
}));



router.get('/:postId/edit', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.postId).populate('author');
    if (!post) {
        // Handle the case where the post is not found
        res.status(404).send('Post not found');
        return;
    }
    if (post.author.username === req.user.username) {
        return res.render('post/postEdit', { post });
    } else {
        req.flash('error', 'You are not authorised to Edit this post');
        res.redirect('/login');
    }
}));

router.patch('/:postId', catchAsync(async (req, res) => {
    const { text, topic } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
        // Handle the case where the post is not found
        res.status(404).send('Post not found');
        return;
    }

    await post.editPost(text, topic);
    res.redirect(`/posts/${req.params.postId}`)
}));

router.delete('/:postId', catchAsync(async (req, res) => {
    // Find the post by ID
    const post = await Post.findById(req.params.postId);
    if (!post) {
        // Handle the case where the post is not found
        res.status(404).send('Post not found');
        return;
    }

    // Remove the post. This will trigger the pre-remove middleware
    await post.deleteWithComments();

    // Send a response or redirect, as appropriate
    res.send('Post deleted');
}));

module.exports = router;