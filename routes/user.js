const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Post = require("../models/Post");
const Comment = require("../models/Comments");
const verifyToken = require("../verifyToken");

// Update User (Only Owner Can Update)
router.put("/:id", verifyToken, async (req, res) => {
    if (req.userId !== req.params.id) {
        return res.status(403).json({ error: "You can only update your own account" });
    }

    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(8);
            req.body.password = await bcrypt.hash(req.body.password, salt); // Fixed bcrypt.hashSync
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user", details: err });
    }
});

// Delete User (Only Owner Can Delete)
router.delete("/:id", verifyToken, async (req, res) => {
    if (req.userId !== req.params.id) {
        return res.status(403).json({ error: "You can only delete your own account" });
    }

    try {
        await User.findByIdAndDelete(req.params.id);
        await Post.deleteMany({ userId: req.params.id });
        await Comment.deleteMany({ userId: req.params.id });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user", details: err });
    }
});

// Get User
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { password, ...info } = user._doc;
        res.status(200).json(info);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user", details: err });
    }
});

module.exports = router;
