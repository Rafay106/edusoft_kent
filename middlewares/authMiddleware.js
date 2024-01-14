const asyncHandler = require("express-async-handler");
const { User } = require("../models/allModels");

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

      if (decode.exp <= new Date()) throw new Error("401");

      req.user = await User.findById(decode._id).select("-salt -hash");

      if (!req.user) {
        res.status(404);
        throw new Error("404");
      }

      req.LANG = loadLanguage(req.user.language, req.user.units);
      req.SETTING = await getSettings(req.user._id);
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
