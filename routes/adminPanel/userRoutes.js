const router = require("express").Router();
const {
  getUsers,
  getUser,
  registerUser,
} = require("../../controllers/admin-panel/userController");

router.route("/").get(getUsers).post(registerUser);

router.route("/:id").get(getUser);

module.exports = router;
