const router = require("express").Router();

// POST route for creating a new location
router.post("/post-locations", authenticateToken, (req, res) => {
  const {
    name,
    address,
    country,
    state,
    city,
    pincode,
    latitude,
    longitude,
    userID,
  } = req.body;
  if (
    !name ||
    !address ||
    !country ||
    !state ||
    !city ||
    !pincode ||
    !latitude ||
    !longitude
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const location = new Location({
    name,
    address,
    country,
    state,
    city,
    pincode,
    latitude,
    longitude,
    userID,
  });
  location
    .save()
    .then((savedLocation) => res.status(201).json(savedLocation))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/get-locations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const locations = await Location.find({ userID: id });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/modify-locations/:id", authenticateToken, async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-locations/:id", authenticateToken, async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
