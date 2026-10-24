const validator = require("validator");

const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password, age, gender } = req.body;

    if (!firstName || !lastName) {
        throw new Error('First name, and Last name are required');
    }

    if (!emailId) {
        throw new Error('Email is required');
    }

    if (!password) {
        throw new Error('Password is required');
    }

    if (age < 18) {
        throw new Error('Age must be at least 18');
    }

    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email address.");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password.");
    }

    return true;
};

module.exports = {
    validateSignupData
};