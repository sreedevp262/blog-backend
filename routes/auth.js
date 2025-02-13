const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

router.use(cookieParser()); // Ensure cookie-parser is used

// Register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Hash password
        // const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // Exclude password before sending response
        const { password: _, ...userInfo } = savedUser._doc;

        res.status(200).json(userInfo);
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const {email,password}= req.body
        const user = await User.findOne({ email});
        console.log(user)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const match = bcrypt.compare(password, user.password);
        console.log(match)
        if (!match) {
            return res.status(401).json({ error: "Wrong password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: "3d" }
        );

        // Exclude password before sending response
        const { password: _, ...info } = user._doc;

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        })
            .status(200)
            .json(info);
    } catch (err) {
        res.status(500).json({ error: "Login failed", details: err });
    }
});

// Logout
router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("token", { sameSite: "None", secure: true })
            .status(200)
            .json({ message: "User logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: "Logout failed", details: err });
    }
});

//Refetch user data
router.get("/refetch", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET, {}, async (err, data) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }

        res.status(200).json(data);
    });
});

module.exports = router;
