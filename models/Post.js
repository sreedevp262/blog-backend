const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        desc: {
            type: String,
            required: true,
            trim: true, // Removed `unique: true`
        },
        photo: {
            type: String,
            trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // References the User model
            required: true,
        },
        categories: {
            type: [String], // Explicitly defining the array type
            default: [], // Default to an empty array
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
