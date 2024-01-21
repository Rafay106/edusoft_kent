const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decode = jwt.verify(token, process.env.SECRET);

      req.user = await User.findById(decode._id).select("-password -__v");

      if (!req.user) {
        res.status(404);
        throw new Error("404");
      }
    } catch (err) {
      console.log(err);
      res.status(401);
      throw new Error("Not Authorized!");
    }

    next();
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
