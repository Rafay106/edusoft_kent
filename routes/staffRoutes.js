const { Staff } = require("../models/allModels");

const router = require("express").Router();

// Create a new staff member
router.post("/post-staff", (req, res) => {
  const { name, email, phone, address, userID } = req.body;
  const staffMember = new Staff({ name, email, phone, address, userID });

  staffMember
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while creating the staff member." });
    });
});

// Get all staff members
router.get("/all-staff/:id", (req, res) => {
  const { id } = req.params;
  Staff.find({ userID: id })
    .then((staffMembers) => {
      res.json(staffMembers);
    })
    .catch((error) => {
      res.status(500).json({
        error: "An error occurred while retrieving the staff members.",
      });
    });
});

// Get a specific staff member by ID
router.get("/staff/:id", (req, res) => {
  const { id } = req.params;
  Staff.findById(id)
    .then((staffMember) => {
      if (staffMember) {
        res.json(staffMember);
      } else {
        res.status(404).json({ error: "Staff member not found." });
      }
    })
    .catch((error) => {
      res.status(500).json({
        error: "An error occurred while retrieving the staff member.",
      });
    });
});

// Update a specific staff member by ID
router.patch("/modify-staff/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  Staff.findByIdAndUpdate(id, { name, email, phone, address }, { new: true })
    .then((staffMember) => {
      if (staffMember) {
        res.json(staffMember);
      } else {
        res.status(404).json({ error: "Staff member not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while updating the staff member." });
    });
});

// Delete a specific staff member by ID
router.delete("/delete-staff/:id", (req, res) => {
  const { id } = req.params;
  Staff.findByIdAndDelete(id)
    .then((staffMember) => {
      if (staffMember) {
        res.json({ message: "Staff member deleted successfully." });
      } else {
        res.status(404).json({ error: "Staff member not found." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the staff member." });
    });
});

module.exports = router;
