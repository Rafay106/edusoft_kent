const router = require("express").Router();

router.post("/buses", (req, res) => {
  const { staffId, deviceId, routeIds, name, userID } = req.body;

  Promise.all([
    Staff.findById(staffId),
    Device.findById(deviceId),
    Route.find({ _id: { $in: JSON.parse(routeIds) } }),
  ])
    .then(([staff, device, routes]) => {
      if (!staff) {
        return res.status(404).json({ error: "Staff not found." });
      }
      if (!device) {
        return res.status(404).json({ error: "Device not found." });
      }
      if (routes.length !== JSON.parse(routeIds).length) {
        return res.status(404).json({ error: "One or more routes not found." });
      }

      const bus = new Bus({
        staff: staff._id,
        device: device._id,
        route: routes.map((route) => route._id),
        userID,
        name,
      });

      return bus.save();
    })
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the bus." });
    });
});

// Get all buses
router.get("/buses/:id", async (req, res) => {
  Bus.find({ userID: req.params.id })
    .populate("staff")
    .populate("device")
    .populate("route")
    .then((buses) => {
      res.json(buses);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the buses." });
    });
});

router.patch("/buses/:id", (req, res) => {
  const { id } = req.params;
  const { staffId, deviceId, routeIds, name } = req.body;

  Promise.all([
    Staff.findById(staffId),
    Device.findById(deviceId),
    Route.find({ _id: { $in: JSON.parse(routeIds) } }),
  ])
    .then(([staff, device, routes]) => {
      if (!staff) {
        return res.status(404).json({ error: "Staff not found." });
      }
      if (!device) {
        return res.status(404).json({ error: "Device not found." });
      }
      if (routes.length !== JSON.parse(routeIds).length) {
        return res.status(404).json({ error: "One or more routes not found." });
      }

      return Bus.findByIdAndUpdate(
        id,
        {
          staff: staff._id,
          device: device._id,
          route: routes.map((route) => route._id),
          name,
        },
        { new: true }
      );
    })
    .then((bus) => {
      if (bus) {
        res.json(bus);
      } else {
        res.status(404).json({ error: "Bus not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while updating the bus." });
    });
});

// Delete a specific bus by ID
router.delete("/buses/:id", (req, res) => {
  const { id } = req.params;
  Bus.findByIdAndDelete(id)
    .then((bus) => {
      if (bus) {
        res.json({ message: "Bus deleted successfully." });
      } else {
        res.status(404).json({ error: "Bus not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the bus." });
    });
});

module.exports = router;
