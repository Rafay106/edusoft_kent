const router = require("express").Router();
const { upload } = require("../middlewares/multerMiddleware");

router.post("/post-employees", upload.single("photo"), async (req, res) => {
  const {
    userID,
    name,
    phone,
    email,
    joining,
    route,
    department,
    designation,
    parent,
    bus,
    device,
    adhaarNo,
    admissionNo,
    birth,
    gender,
  } = req.body;

  // Validate required data
  if (
    !userID ||
    !name ||
    !phone ||
    !email ||
    !joining ||
    !birth ||
    !gender ||
    !department ||
    !designation
  ) {
    return res.status(400).json({ error: "Required data missing." });
  }

  const employee = new Employee({
    userID,
    name,
    phone,
    email,
    joining: new Date(joining),
    route,
    parent,
    bus,
    device,
    department,
    designation,
    adhaarNo,
    admissionNo,
    gender,
    birth: new Date(birth),
    photoUrl: req.file ? req.file.path : "",
  });

  const savedEmployee = await employee.save();

  const storeAttendance = new Attendance({
    userID,
    type: "exit",
    employee: savedEmployee._id,
    deviceID: "registered",
    entryTime: new Date(joining),
    exitTime: new Date(joining),
  });

  await storeAttendance.save();

  return res.status(201).json(savedEmployee);
});

router.post("/employees/:id/updateNumbers", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { numbers } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.numbers = JSON.parse(numbers);
    await employee.save();

    return res.status(200).json({ message: "Numbers updated successfully" });
  } catch (error) {
    console.error("Error updating numbers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get-employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (id == "D-53") {
      const uploadsFolderPath = path.join(__dirname, "uploads");
      fs.readdir(uploadsFolderPath, async (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return;
        }
        const tempList = [];
        for (let index = 0; index < files.length; index++) {
          const element = files[index];
          tempList.push("uploads/" + element);
        }
        const employees = await Employee.find({})
          .populate([
            "route",
            "parent",
            "bus",
            "device",
            "designation",
            "department",
          ])
          .lean();
        const filteredEmployees = employees.filter((employee) => {
          const photoUrl = employee.photoUrl;
          return tempList.includes(photoUrl);
        });
        const tempFilteredEmployees = [];
        for (let index = 0; index < filteredEmployees.length; index++) {
          const element = filteredEmployees[index];
          if (!element.numbers) {
            tempFilteredEmployees.push(element);
          } else {
            if (element.numbers.length == 0) {
              tempFilteredEmployees.push(element);
            }
          }
        }
        res.json(filteredEmployees);
        // res.json(tempFilteredEmployees);
      });
    } else {
      const employees = await Employee.find({})
        .populate([
          "route",
          "parent",
          "bus",
          "device",
          "designation",
          "department",
        ])
        .lean();
      res.json(employees);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
