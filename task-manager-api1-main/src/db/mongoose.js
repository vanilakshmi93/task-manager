const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/task-manager-api", {
    autoIndex: true,
  })
  .then(() => {
    console.log("Connected Successfully");
  })
  .catch((error) => {
    console.log(error);
  });