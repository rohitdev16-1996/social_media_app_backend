/* Import the express package and store it in the variable express*/
const express = require('express');

/* Import the file to establish the connection to the cluster */
const { connectDB } = require('./config/database');

/* Create an application of express and store it in the variable app */
const app = express();

const { User } = require('./models/user');

app.post("/signup", async (req, res) => {
    const userObj = {
        firstName: "John",
        lastName: "Doe",
        emailId: "john.doe@example.com",
        password: "password123",
        age: 30,
        gender: "Male"
    };

    const user = new User(userObj);

    try {
        const saved = await user.save();
        console.log('User saved:', saved);
        res.status(201).send("User created successfully");
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send("Error creating user");
    }
});

app.use("/", (req, res) => {
    res.send("Hello World!");
});

/* Connect to the database first and then start the server, if the database
connection is successful */
connectDB()
    .then(() => {
        console.log('Database connection established successfully');

        /* The app listens for requests on port 7777 */
        app.listen(7777, () => {
            /* Called only when the server is up and running */
            console.log('Server is up and running');
        });
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });
