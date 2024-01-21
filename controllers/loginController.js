const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const ERROR = require("../constants/errorConstants");
const RES = require("../constants/responseConstants");
const { generateToken } = require("../utils/fn_jwt");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400);
    throw new Error(ERROR.IR.EMAIL);
  }

  if (!password) {
    res.status(400);
    throw new Error();
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error(ERROR.INVALID_EOP);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error(ERROR.INVALID_EOP);
  }

  res.status(200).json({
    message: RES.LOGGED_IN,
    token: generateToken({ _id: user._id }),
    success: true,
    type: user.privileges.type,
  });
});

const mobileLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400);
    throw new Error(ERROR.IR.EMAIL);
  }

  if (!password) {
    res.status(400);
    throw new Error();
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error(ERROR.INVALID_EOP);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.status(401);
    throw new Error(INVALID_EOP);
  }

  delete user.password;

  res.status(200).json({
    message: RES.LOGGED_IN,
    token: generateToken({ email: user.email }),
    success: true,
    type: user.privileges.type,
    user: user,
  });
});

module.exports = {
  login,
  mobileLogin,
};
