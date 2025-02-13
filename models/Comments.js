const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            required: true,
            trim: true, // Removes unnecessary spaces
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post', // References the Post model
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // References the User model
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
