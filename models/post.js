const mongoose = require('mongoose');
const Comment = require('./comment');
const User = require('./user');

const postSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    text: {
        type: String,
        required: true,
        minlength: 100
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    views: {
        type: Number,
        default: 0
    }
});

postSchema.methods.deleteWithComments = async function() {
    // Delete comments associated with this post
    await Comment.deleteMany({ post: this._id });

    // Delete this post
    await this.deleteOne();
};

postSchema.methods.editPost = async function(text, topic) {
    this.text = text;
    this.topic = topic;
    await this.save();
}

postSchema.methods.increseView = async function () {
    this.views++;
    await this.save();
}

postSchema.methods.addComment = async function (username, text) {
    const user = await User.findOne({username});
    const newComment = new Comment({ text, user, post: this });
    this.comments.push(newComment);
    await this.save();
    await newComment.save();
}



const Post = mongoose.model('Post', postSchema);

module.exports = Post;

