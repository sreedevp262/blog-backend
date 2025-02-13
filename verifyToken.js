const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token; // Fixed typo

    if (!token) {
        return res.status(401).json({ message: "You are not authenticated. Token is missing." });
    }

    jwt.verify(token, process.env.SECRET, async (err, data) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }

        req.userId = data._id; // Store user ID
        next();
    });
};

module.exports = verifyToken;
