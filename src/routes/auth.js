const validator = require("validator");
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const express = require("express");
const authRouter = express.Router();
const { User } = require("../models/user");

/* Handle POST requests to the /signup endpoint */
authRouter.post("/signup", async (req, res) => {
    try {
        /* Validation of Data. */
        validateSignupData(req);

        /* Storing only the fields which we have in the Database. */
        const { firstName, lastName, emailId, password, age, gender } = req.body;

        /* Encrypt the password. */
        const passwordHash = await bcrypt.hash(password, 10);

        /* Create the object which has to be passed to the database */
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
        });

        /* Save the objet to the database */
        const saved = await user.save();

        /* Print the message on the console that we have saved the data to the database.
               This line should be removed from the production code, we do not want to give
               any message to the user from the console log.
            */
        console.log("User saved:", saved);

        /* Send the response to the user that the User is created successfully. */
        res.status(201).send("User created successfully");
    } catch (error) {
        /* Send an error response of Bad Request code 400 */
        res.status(400).send("ERROR : " + error.message);
    }
});

/* Handle POST requests to the /login endpoint */
authRouter.post("/login", async (req, res) => {
    try {
        /* De-structuring the emailId and password from the request body */
        const { emailId, password } = req.body;

        /* Validating the email Id using the validator package */
        if (!validator.isEmail(emailId)) {
            res.status(400).send("ERROR : Invalid email format");
        }

        /* Find the user in the Database */
        const user = await User.findOne({
            emailId,
        });

        /* Check if the user is found or not? */
        if (!user) {
            throw new Error("Invalid credentials");
        }

        /* Compare the password using the bcrypt.compare() */
        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {
            /* Step 1: Create a JWT Token */
            const token = await user.getJWT();

            /* Step 2: Add the token to cookie */
            // inside login, after the email and password are validated
            res.cookie("token", token);

            /* Step 3: Send the response back to user */
            /* Return the Login Successful message */
            /* Return the user data */
            res.status(200).send(user);
        } else {
            throw new Error("Invalid Password");
        }
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

/* Handle POST requests to the /logout endpoint */
authRouter.post("/logout", (req, res) => {
    /* Step 1: Clear the cookie */
    /* Clear the cookie */
    res.clearCookie("token", null, {
        /* Set the expiration date immediately */
        expires: new Date(Date.now()),
    });

    /* Step 2: Send the response back to user */
    /* Send the response back to user */
    res.status(200).send("Logout successful");
});

module.exports = authRouter;
