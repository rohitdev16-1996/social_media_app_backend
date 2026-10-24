const mongoose = require("mongoose");
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        validate(value) {
            if (!['male', 'female', 'other'].includes(value)) {
                throw new Error('Gender must be either male, female, or other');
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("The photo URL is not valid");
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about me section. You can update it later."
    },
    skills: {
        type: [String],
    },
},
    {
        timestamps: true
    }
);

const UserActivation = mongoose.model("User", userSchema, "User");

module.exports = {
    User: UserActivation
};
