/* Import the express package and store it in the variable express*/
const express = require("express");

/* Import the file to establish the connection to the cluster */
const { connectDB } = require("./config/database");

/* Create an application of express and store it in the variable app */
const app = express();

const { User } = require("./models/user");

const validator = require("validator");

const { validateSignupData } = require("./utils/validation");

const bcrypt = require("bcrypt");

const cookieParser = require("cookie-parser");

const jwt = require("jsonwebtoken");

const { userAuth } = require("./middlewares/auth");

require("dotenv").config();

/* Converting the JSON data in the request body to a JavaScript object */
app.use(express.json());

/* Parsing the cookie */
app.use(cookieParser());

/* Handle POST requests to the /signup endpoint */
app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
  try {
    /* De-structuring the emailId and password from the request body */
    const { emailId, password } = req.body;

    /* Validating the email Id using the validator package */
    if (!validator.isEmail(emailId)) {
      res.status(400).send("ERROR : " + err.message);
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
      res.status(200).send("Login successful");
    } else {
      throw new Error("Invalid Password");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User does not exist");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + " sent the connection request");
});

/* Handle GET requests to fetch a user by email */
app.get("/userByEmail", async (req, res) => {
  /* Extract the emailId from the request body */
  const userEmailId = req.body.emailId;

  /* Check if emailId is provided */
  if (!userEmailId) {
    /* Send an error response of code 400 i.e. Bad Request if emailId is not provided */
    return res.status(400).send("emailId is required");
  }

  try {
    /* Find the user by emailId */
    const users = await User.find({ emailId: userEmailId });

    /* Send the found users or an error response */
    if (users.length === 0) {
      /* Send an error response of code 404 i.e. Not Found if no user is found */
      res.status(404).send("User not found");
    } else {
      /* Send the found users */
      res.send(users);
    }
  } catch (err) {
    /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
    res.status(500).send("Something went wrong");
  }
});

/* Handle GET requests to fetch the feed of users */
app.get("/feed", async (req, res) => {
  try {
    /* Fetch all users from the database */
    const users = await User.find();

    /* Send the fetched users as a response */
    res.send(users);
  } catch (err) {
    /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
    res.status(500).send("Something went wrong");
  }
});

/* Handle DELETE requests to delete a user */
app.delete("/userDelete", async (req, res) => {
  /* Extract the userId from the request body */
  const userId = req.body.userId;

  try {
    /* Find the user by ID and delete them */
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      /* Send an error response of code 404 i.e. Not Found if no user is found */
      return res.status(404).send("User not found");
    }
    res.send("User Deleted Successfully");
  } catch (err) {
    /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
    res.status(500).send("Something went wrong");
  }
});

/* Handle PATCH requests to update a user */
app.patch("/userUpdate/:userId", async (req, res) => {
  /* Extract the userId and updateData from the request body */
  const userId = req.params?.userId;

  /* Extract the update data from the request body */
  const data = req.body;

  try {
    const ALLOWED_UPDATES = [
      "userId",
      "photoUrl",
      "about",
      "gender",
      "age",
      "skills",
    ];

    const isUpdateAllowed = Object.keys(data).every((update) =>
      ALLOWED_UPDATES.includes(update),
    );

    if (!isUpdateAllowed) {
      /* Send an error response of code 400 i.e. Bad Request if the update is not allowed */
      return res.status(400).send("Update not allowed");
    }

    if (data?.skills > 10) {
      throw new Error("Skills cannot be more than 10");
    }

    /* Find the user by ID and update them with the provided data */
    await User.findByIdAndUpdate(userId, data, {
      returnDocument:
        "after" /* Return the updated document after the update */,
      runValidators: true /* Run validation on the update data */,
    });
    res.send("User Updated Successfully");
  } catch (err) {
    /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
    res.status(400).send("Something went wrong " + err.message);
  }
});

/* Handle PATCH requests to update a user */
app.patch("/userUpdateGetBefore", async (req, res) => {
  /* Extract the userId and updateData from the request body */
  const userId = req.body.userId;

  /* Extract the update data from the request body */
  const data = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "before" /* Return the document before the update */,
      runValidators: true /* Run validation on the update data */,
    });
    res.send(updatedUser);
  } catch (err) {
    /* Send an error response of code 500 i.e. Internal Server Error if something goes wrong */
    res.status(500).send("Something went wrong" + err.message);
  }
});

app.use("/", (req, res) => {
  res.send("Hello World!");
});

/* Connect to the database first and then start the server, if the database
connection is successful */
connectDB()
  .then(() => {
    console.log("Database connection established successfully");

    /* The app listens for requests on port 7777 */
    app.listen(7777, () => {
      /* Called only when the server is up and running */
      console.log("Server is up and running");
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
