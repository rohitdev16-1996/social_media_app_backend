const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const userAuth = async (req, res, next) => {
    try {
        /* Read the token */
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Token is not valid");
        }

        /* Verify the token */
        const decodeMessage = await jwt.verify(token, process.env.AUTH_SECRET_KEY);

        /* Validate the token */
        const { _id } = decodeMessage;

        /* Find the user using the id from the database */
        const user = await User.findById(_id);

        /* User does not exist */
        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;

        /* Move to the next handler */
        next();
    } catch (err) {
        res.status(400).send("ERROR auth.js(middleware): " + err.message);
    }
}

module.exports = {
    userAuth
}

