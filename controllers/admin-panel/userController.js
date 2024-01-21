const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const ERROR = require("../../constants/errorConstants");
const RES = require("../../constants/responseConstants");
const { createSearchQuery, paginatedQuery } = require("../../utils/fn_common");

// @desc    Get all users paginated
// @route   GET /admin-panel/user
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.rows) || 10;
  const sort = req.query.sort || "username";
  const searchField = req.query["search-field"];
  const searchValue = req.query["search-value"];

  const query = {};

  if (searchField && searchValue) {
    if (searchField === "all") {
      const fields = ["email", "name", "mobile", "role"];

      const searchQuery = createSearchQuery(fields, searchValue);
      query["$or"] = searchQuery["$or"];
    } else {
      const searchQuery = createSearchQuery([searchField], searchValue);
      query["$or"] = searchQuery["$or"];
    }
  }

  const select = {
    "privileges.level": 1,
    email: 1,
    name: 1,
    mobile: 1,
    role: 1,
    createdAt: 1,
  };

  const results = await paginatedQuery(User, query, select, page, limit, sort);

  res.status(200).json(results);
});

// @desc    Get all users paginated
// @route   GET /admin-panel/user/:id
// @access  Private
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").lean();

  if (!user) {
    res.status(404);
    throw new Error(ERROR.NF_ID.USER.replace("%id%", req.params.id));
  }

  res.status(200).json({ user, success: true });
});

// @desc    Add a user
// @route   POST /admin-panel/user
// @access  Private
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, name, mobile, role, level } = req.body;

  const privileges = {
    level,
  };

  const user = await User.create({
    email,
    password,
    mobile,
    name,
    privileges,
    role,
  });

  res.status(201).json({ msg: user._id, success: true });
});

// @desc    Update a user
// @route   PATCH /admin-panel/user/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const { email, name, mobile, role } = req.body;

  if (name?.first === "") name.first = undefined;
  if (name?.last === "") name.last = undefined;

  await User.updateOne(
    { _id: req.params.id },
    {
      email,
      email_verified: email ? false : undefined,
      "name.first": name?.first,
      "name.mid": name?.mid,
      "name.last": name?.last,
      mobile,
      role,
    }
  );

  res.status(200).json({ success: true });
});

// @desc    Delete a user
// @route   DELETE /admin-panel/user/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  await User.deleteOne({ _id: req.params.id });

  res.status(200).json({ success: true });
});

module.exports = { getUsers, getUser, registerUser, updateUser, deleteUser };
