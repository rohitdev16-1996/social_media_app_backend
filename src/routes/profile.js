const express = require("express");
const profileRouter = express.Router();
const userObj = require("../middlewares/auth");
const userAuth = userObj.userAuth;
const { validateEditProfileData } = require("../utils/validation");

/* Get the authenticated user's profile */
profileRouter.get("/profile/view", userAuth, async (req, res) => {
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

/* Update the authenticated user's profile */
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (validateEditProfileData(req)) {
      throw new Error("Invalid fields in the request body");
      return res.status(400).send("Invalid fields in the request body");
    }

    /* user is attached by the userAuth middleware */
    const loggedInUser = req.user;

    /* Update the user with the new data */
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    /* Save the updated user */
    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile was updated successfully`,
      data: loggedInUser,
    });

  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});


module.exports = profileRouter;
