const router = require("express").Router();

router.post("/post-company", authenticateToken, (req, res) => {
  const { name, location, email, phone, userID } = req.body;
  if (!name || !location || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const company = new Company({ name, location, email, phone, userID });
  company
    .save()
    .then((savedCompany) => res.status(201).json(savedCompany))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/get-company/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.find({ userID: id });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/modify-company/:id", authenticateToken, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-company/:id", authenticateToken, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
