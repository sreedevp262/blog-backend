const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const postRoute = require('./routes/post');
const commentRoute = require('./routes/comments');

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
    origin: '*',
    credentials: true,
};
// app.use(cors(corsOptions));
app.use(cors({
    origin: 'https://blog-zoople.netlify.app',
    credentials: true,
}));

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");
    } catch (err) {
        console.error("Database connection error:", err);
    }
};

// Serve static images
app.use("/images", express.static(path.join(__dirname, "/images")));

app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Image upload setup
const storage = multer.diskStorage({
    destination: (req, file, fn) => {
        fn(null, "images");
    },
    filename: (req, file, fn) => {
        fn(null, Date.now() + path.extname(file.originalname)); // Generates a unique filename
    },
});

const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.status(200).json("Image uploaded successfully");
});

// Start server after DB connection
ConnectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`App connected on port ${process.env.PORT}`);
    });
}).catch(err => console.error("Failed to start server:", err));
