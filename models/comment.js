const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    date: {
        type: Date,
        default: Date.now()
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


commentSchema.methods.addComment = async function (comment) {
    this.comments.push(comment);
    await this.save();
}


const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;