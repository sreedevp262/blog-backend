const express = require("express");
const router = express.Router();
const Comment = require("../models/Comments");
const verifyToken = require("../verifyToken");

// Create Comment
router.post("/create", verifyToken, async (req, res) => {
    try {
        const newComment = new Comment({
            ...req.body,
            userId: req.userId, // Ensure comment is linked to logged-in user
        });
        const savedComment = await newComment.save();
        res.status(200).json(savedComment);
    } catch (err) {
        res.status(500).json({ error: "Failed to create comment", details: err });
    }
});

// Update Comment (Only Owner Can Update)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.userId !== req.userId) {
            return res.status(403).json({ error: "You can only update your own comments" });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.status(200).json(updatedComment);
    } catch (err) {
        res.status(500).json({ error: "Failed to update comment", details: err });
    }
});

// Delete Comment (Only Owner Can Delete)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.userId !== req.userId) {
            return res.status(403).json({ error: "You can only delete your own comments" });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete comment", details: err });
    }
});

// Get Comments for a Specific Post
router.get("/post/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId }); // Fixed `postId` case
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve comments", details: err });
    }
});

module.exports = router;
