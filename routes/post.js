const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comments");
const verifyToken = require("../verifyToken");

// Create Post
router.post("/create", verifyToken, async (req, res) => {
    try {
        const newPost = new Post({
            ...req.body,
            userId: req.userId, // Ensure the post is linked to the logged-in user
        });
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: "Failed to create post", details: err });
    }
});

// Update Post (Only Owner Can Update)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.userId !== req.userId) {
            return res.status(403).json({ error: "You can only update your own posts" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: "Failed to update post", details: err });
    }
});

// Delete Post (Only Owner Can Delete)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.userId !== req.userId) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ postId: req.params.id }); // Fixed `postId` case
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete post", details: err });
    }
});

// Get Post Details
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); // Fixed method name
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch post", details: err });
    }
});

// Get All Posts (Search Feature)
router.get("/", async (req, res) => {
    try {
        const searchFilter = req.query.search
            ? { title: { $regex: req.query.search, $options: "i" } } // Fixed `req.query.search`
            : {};

        const posts = await Post.find(searchFilter); // Fixed `Post.find()`
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch posts", details: err });
    }
});

// Get Posts by User
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user's posts", details: err });
    }
});

module.exports = router;
