const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true, // Ensures email is stored in lowercase
        },
        password: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
            trim: true,
            default: "Hello! I'm new here.", // Default bio text
        },
    },
    { timestamps: true } // Fixed `timestamps`
);

// Hash password before saving the user
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Only hash if password is changed

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("User", UserSchema);
