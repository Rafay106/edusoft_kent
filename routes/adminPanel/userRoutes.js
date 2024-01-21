const router = require("express").Router();
const {
  getUsers,
  getUser,
  registerUser,
  updateUser,
  deleteUser,
} = require("../../controllers/admin-panel/userController");

router.route("/").get(getUsers).post(registerUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
