const router = require("express").Router();

router.post("/post-designation", async (req, res) => {
  const designation = new Designation({
    department: req.body.department,
    name: req.body.name,
    userID: req.body.userID,
  });
  await designation
    .save()
    .then((savedCompany) => res.status(201).json(savedCompany))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/get-designation/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const designation = await Designation.find({ userID: id });
    res.json(designation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/modify-designation/:id", authenticateToken, async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(designation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete(
  "/delete-designation/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const designation = await Designation.findByIdAndDelete(req.params.id);
      res.json(designation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
