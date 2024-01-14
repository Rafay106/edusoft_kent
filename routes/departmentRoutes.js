const router = require("express").Router();

router.post("/post-department", async (req, res) => {
  const department = new Department({
    company: req.body.company,
    name: req.body.name,
    userID: req.body.userID,
  });
  await department
    .save()
    .then((savedCompany) => res.status(201).json(savedCompany))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/get-departments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const department = await Department.find({ userID: id });
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/modify-department/:id", authenticateToken, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-department/:id", authenticateToken, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
