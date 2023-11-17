const express = require("express"),
  router = express.Router(),
  userRouter = require("./user.router");


router.use("/users", userRouter);
module.exports = router;
