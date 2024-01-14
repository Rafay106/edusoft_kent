const router = require("express").Router();
const { User } = require("../models/allModels");
const bcrypt = require("bcrypt");

// Implement registration
router.post("/register", async (req, res) => {
  const { email, password, name, mobile, type } = req.body;

  // Check if user already exists
  if (await User.exists({ email })) {
    return res
      .status(409)
      .json({ message: "Email already taken", success: false });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    mobile,
    name,
    type,
  });

  res.status(201).json({ message: "User created", success: true });
});

router.post("/mobile/change-password", async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;

  const user = await User.findById(id).select("password");

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res
      .status(401)
      .json({ message: "Incorrect current password", success: false });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await User.findByIdAndUpdate(id, { password: hashedNewPassword });

  return res
    .status(200)
    .json({ message: "Password changed successfully", success: true });
});

router.put("/mobile/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found", success: false });
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.mobile = mobile || user.mobile;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User information successfully",
    success: true,
    updatedUser,
  });
});

module.exports = router;
