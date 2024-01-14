const router = require("express").Router();
const { User } = require("../models/allModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET } = process.env;

// Implement login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ message: "Invalid email or password", success: false });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ message: "Invalid email or password", success: false });
  }

  const token = jwt.sign({ email: user.email }, SECRET, {
    expiresIn: "1h",
  });

  if (email == "prasunranjan54@gmail.com") {
    res.status(200).json({
      message: "Logged in successfully",
      token,
      success: true,
      type: "admin",
    });
  } else {
    res.status(200).json({
      message: "Logged in successfully",
      token,
      success: true,
      type: "office",
    });
  }
});

router.post("/mobile/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ message: "Invalid email or password", success: false });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res
      .status(401)
      .json({ message: "Invalid email or password", success: false, user });
  }

  const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: "1h" });

  res.status(200).json({
    message: "Logged in successfully",
    token,
    success: true,
    type: "admin",
    user: user,
  });
});

module.exports = router;
