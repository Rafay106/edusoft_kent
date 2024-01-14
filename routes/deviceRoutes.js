const router = require("express").Router();

router.post("/post-device", authenticateToken, (req, res) => {
  const { deviceID, deviceName, userID } = req.body;

  if (!deviceID || !deviceName) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const device = new Device({ deviceID, deviceName, userID });
  device
    .save()
    .then((savedDevice) => res.status(201).json(savedDevice))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/get-devices/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const devices = await Device.find({ userID: id });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/modify-device/:id", authenticateToken, async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-device/:id", authenticateToken, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
