const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();

//Register User
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//Login User
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//Logout User
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token != req.token
    );
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Logout All
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Get Users
router.get("/users/me", auth, async (req, res) => {
  const user = req.user;
  res.status(200).send(user);
});

//Get User By ID
//not required anymore as we are getting that through the auth token
// router.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(400).send();
//     }
//     res.send(user);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

//Update User by ID
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const validUpdates = ["name", "email", "age", "password"];
  const isValidUpdates = updates.every((update) =>
    validUpdates.includes(update)
  );
  if (!isValidUpdates) {
    return res.status(400).send({ error: "Invalid Updates" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Delete User By Id
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.clearTasks();
    await req.user.deleteOne();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
