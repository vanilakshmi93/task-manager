const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

//Register Task
router.post("/tasks", auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Get Tasks
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  try {
    // const tasks = await Task.find({ owner: req.user._id, completed: true });
    // await req.user.populate('tasks').exec()
    await req.user.populate({ path: "tasks", match });
    res.send(req.user.tasks);
    // res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Get Task By ID
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(400).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Update Task By ID
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const validUpdates = ["description", "completed"];
  const isValidUpdates = updates.every((update) =>
    validUpdates.includes(update)
  );
  if (!isValidUpdates) {
    return res.status(400).send({ error: "Invalid Updates" });
  }
  try {
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Delete Task By ID
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
