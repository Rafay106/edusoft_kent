const router = require("express").Router();

router.post("/post-parent", async (req, res) => {
  const { name, email, phone, address, userID } = req.body;
  const parent = await Parent.findOne({ email });
  if (parent) {
    return res
      .status(409)
      .json({ message: "Email already taken", success: false });
  }
  const hashedPassword = await bcrypt.hash("123456", 10);
  const newUser = new Parent({
    email,
    password: hashedPassword,
    phone,
    address,
    name,
    userID,
  });
  await newUser.save();
  newUser
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while creating the parent." });
    });
});

router.patch("/modify-parent/:id", (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  Parent.findByIdAndUpdate(id, { name, address }, { new: true })
    .then((parent) => {
      if (parent) {
        res.json(parent);
      } else {
        res.status(404).json({ error: "Parent not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while updating the parent." });
    });
});

router.get("/all-parents/:id", (req, res) => {
  const { id } = req.params;
  Parent.find({ userID: req.params.id })
    .then((parents) => {
      res.json(parents);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the parents." });
    });
});

router.delete("/delete-parents/:id", (req, res) => {
  const { id } = req.params;

  Parent.findByIdAndDelete(id)
    .then((parent) => {
      if (parent) {
        res.json({ message: "Parent deleted successfully." });
      } else {
        res.status(404).json({ error: "Parent not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the parent." });
    });
});

router.post("/mobile-parent/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Employee.find({
    $or: [{ phone: email }, { email: email }, { admissionNo: email }],
  });
  if (!user) {
    return res
      .status(401)
      .json({ message: "Invalid email or password", success: false });
  }
  // const passwordMatch = await bcrypt.compare(password, user.password);
  // if (!passwordMatch) {
  //   return res.status(401).json({ message: 'Invalid email or password', success: false, user });
  // }
  res
    .status(200)
    .json({ message: "Logged in successfully", success: true, user: user });
});

module.exports = router;
