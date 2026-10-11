/* Import the express package and store it in the variable express*/
const express = require('express');

/* Import the file to establish the connection to the cluster */
const { connectDB } = require('./config/database');

/* Create an application of express and store it in the variable app */
const app = express();

const { User } = require('./models/user');

/* Converting the JSON data in the request body to a JavaScript object */
app.use(express.json());

/* Handle POST requests to the /signup endpoint */
app.post("/signup", async (req, res) => {
    const userObj = req.body;
    const user = new User(userObj);

    try {
        const saved = await user.save();

        console.log('User saved:', saved);

        res.status(201).send("User created successfully");

    } catch (error) {
        console.error('Error creating user:', error);

        /* Send an error response of Bad Request code 400 */
        res.status(400).send("Error creating user");
    }
});

/* Handle GET requests to fetch a user by email */
app.get('/userByEmail', async (req, res) => {
    /* Extract the emailId from the request body */
    const userEmailId = req.body.emailId;

    /* Check if emailId is provided */
    if (!userEmailId) {
        /* Send an error response of code 400 i.e. Bad Request if emailId is not provided */
        return res.status(400).send('emailId is required');
    }

    try {
        /* Find the user by emailId */
        const users = await User.find({ emailId: userEmailId });

        /* Send the found users or an error response */
        if (users.length === 0) {
            /* Send an error response of code 404 i.e. Not Found if no user is found */
            res.status(404).send('User not found');
        }
        else {
            /* Send the found users */
            res.send(users);
        }
    } catch (err) {
        /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
        res.status(500).send('Something went wrong');
    }
});

/* Handle GET requests to fetch the feed of users */
app.get('/feed', async (req, res) => {
    try {
        /* Fetch all users from the database */
        const users = await User.find();

        /* Send the fetched users as a response */
        res.send(users);
    } catch (err) {
        /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
        res.status(500).send('Something went wrong');
    }
});

/* Handle DELETE requests to delete a user */
app.delete('/userDelete', async (req, res) => {

    /* Extract the userId from the request body */
    const userId = req.body.userId;

    try {
        /* Find the user by ID and delete them */
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            /* Send an error response of code 404 i.e. Not Found if no user is found */
            return res.status(404).send('User not found');
        }
        res.send('User Deleted Successfully');
    } catch (err) {
        /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
        res.status(500).send('Something went wrong');
    }
});

/* Handle PATCH requests to update a user */
app.patch('/userUpdate', async (req, res) => {
    /* Extract the userId and updateData from the request body */
    const userId = req.body.userId;

    /* Extract the update data from the request body */
    const data = req.body;

    try {
        /* Find the user by ID and update them with the provided data */
        await User.findByIdAndUpdate(userId, data);
        res.send("User Updated Successfully");
    } catch (err) {
        /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
        res.status(500).send('Something went wrong');
    }
});

/* Handle PATCH requests to update a user */
app.patch('/userUpdateGetBefore', async (req, res) => {
    /* Extract the userId and updateData from the request body */
    const userId = req.body.userId;

    /* Extract the update data from the request body */
    const data = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, data, { returnDocument: 'before' });
        res.send(updatedUser);
    } catch (err) {
        /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
        res.status(500).send('Something went wrong');
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
