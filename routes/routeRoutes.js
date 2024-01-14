const router = require("express").Router();

router.post("/post-routes", (req, res) => {
  const { name, address, userID } = req.body;
  const route = new Route({ name, address, userID });
  route
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while creating the route." });
    });
});

// Get all routes
router.get("/all-routes/:id", async (req, res) => {
  Route.find({ userID: req.params.id })
    .then((routes) => {
      res.json(routes);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the routes." });
    });
});

router.patch("/modify-routes/:id", (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  Route.findByIdAndUpdate(id, { name, address }, { new: true })
    .then((route) => {
      if (route) {
        res.json(route);
      } else {
        res.status(404).json({ error: "Route not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while updating the route." });
    });
});

// Delete a specific route by ID
router.delete("/delete-routes/:id", (req, res) => {
  const { id } = req.params;

  Route.findByIdAndDelete(id)
    .then((route) => {
      if (route) {
        res.json({ message: "Route deleted successfully." });
      } else {
        res.status(404).json({ error: "Route not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the route." });
    });
});

module.exports = router;
