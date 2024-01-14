const router = require("express").Router();

router.post("/post-attendance", async (req, res) => {
  console.log(req.body);
  // res.send('Attendance recorded successfully');
  const { employeeId, timestamp, deviceID, userID } = req.body;
  const employee = await Employee.findById(employeeId).exec();
  // console.log(employee.name);
  if (employeeId) {
    const employee = await Employee.findById(employeeId).exec();
    try {
      if (!employee) {
        res.send("Attendance recorded successfully");
        return;
      }
      const attendance = await Attendance.findOne({
        employee: employeeId,
        type: "entry",
      }).exec();
      const type = "entry";
      if (!attendance || attendance == null) {
        const latestEntry = await Attendance.findOne({
          employee: employeeId,
          type: "exit",
        })
          .sort({ exitTime: -1 })
          .exec();
        if (latestEntry) {
          const differenceMs = new Date(timestamp) - latestEntry.exitTime;
          const differenceMinutes = differenceMs / (1000 * 60);
          if (differenceMinutes > 2) {
            storeAttendance = new Attendance({
              type,
              employee: employeeId,
              deviceID: deviceID,
              userID,
              entryTime: new Date(timestamp),
              exitTime: new Date(timestamp),
            });
            await storeAttendance.save(async (err) => {
              if (err) {
                res.send("Attendance recorded successfully");
                return;
              }
              notification = new AttendanceEvent({
                studentID: employeeId,
                type: type,
                userID,
                deviceID: deviceID,
                status: -1,
                time: new Date(timestamp),
              });
              await notification.save((err) => {
                if (err) {
                  res.send("Attendance recorded successfully");
                  return;
                }
                res.send("Attendance recorded successfully");
              });
            });
          }
        } else {
          res.send("Attendance recorded successfully");
        }
      } else {
        type = "exit";
        const differenceMs = new Date(timestamp) - attendance.entryTime;
        const differenceMinutes = differenceMs / (1000 * 60);
        if (differenceMinutes > 2) {
          attendance.exitTime = new Date(timestamp);
          attendance.type = "exit";
          await attendance.save(async (err) => {
            if (err) {
              res.status(500).send("Error saving attendance record");
              return;
            }
            notification = new AttendanceEvent({
              studentID: employeeId,
              type: type,
              userID,
              deviceID: deviceID,
              status: -1,
              time: new Date(timestamp),
            });
            await notification.save((err) => {
              if (err) {
                res.status(500).send("Error saving attendance record");
                return;
              }
              res.send("Attendance recorded successfully");
            });
          });
        } else {
          res.send("Attendance recorded successfully");
        }
      }
    } catch (e) {}
  } else {
    res.send("Attendance recorded successfully");
  }
});

router.get("/get-all-attendance/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const attendance = await Attendance.find({ userID: id }).populate({
      path: "employee",
      populate: [
        {
          path: "route",
          model: "Route",
        },
        {
          path: "parent",
          model: "Parent",
        },
        {
          path: "bus",
          model: "Bus",
        },
      ],
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/get-attendance", (req, res) => {
  const { startDate, endDate } = req.body;
  Attendance.find(
    {
      entryTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
    },
    (err, attendance) => {
      if (err) {
        res.status(500).send("Error finding attendance records");
        return;
      }
      res.send(attendance);
    }
  );
});

router.post("/employee/get-attendance", (req, res) => {
  const { startDate, endDate, employee } = req.body;
  Attendance.find(
    {
      employee: employee,
      entryTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
    },
    (err, attendance) => {
      if (err) {
        res.status(500).send("Error finding attendance records");
        return;
      }
      const presentDates = [];
      const absentDates = [];
      const halfDayDates = [];
      const lateDates = [];
      const holidayDates = [];

      // Loop through the attendance records and classify each date as present or absent
      for (
        let date = new Date(startDate);
        date <= new Date(endDate);
        date.setDate(date.getDate() + 1)
      ) {
        const dateStr = date.toDateString();
        const attendanceRecord = attendance.find(
          (record) => record.entryTime.toDateString() === dateStr
        );
        if (attendanceRecord) {
          presentDates.push(date.toISOString());
        } else {
          absentDates.push(date.toISOString());
        }

        if (endDate - startDate < 16 * 60 * 60 * 1000) {
          halfDayDates.push(date.toISOString());
        }
      }

      const response = {
        presentDates,
        absentDates,
        halfDayDates,
        holidayDates,
        lateDates,
      };
      res.send(response);
    }
  );
});

router.post("/mobile/get-attendance/:id", async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, busID, search } = req.body;
  console.log(search);
  if (busID != "all") {
    if (busID != null || busID != "null") {
      const resultBus = await Bus.find({
        _id: { $in: busID.split(", ") },
      }).exec();
      const resultDevice = await Device.find({
        _id: { $in: resultBus.map((element) => element.device) },
      }).exec();
      try {
        const attendance = await Attendance.find({
          entryTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
          deviceID: { $in: resultDevice.map((element) => element.deviceID) },
          userID: id,
        }).populate({
          path: "employee",
          populate: [
            {
              path: "route",
              model: "Route",
            },
            {
              path: "parent",
              model: "Parent",
            },
            {
              path: "bus",
              model: "Bus",
            },
            {
              path: "department",
              model: "Department",
            },
            {
              path: "designation",
              model: "Designation",
            },
          ],
        });
        if (search != "") {
          console.log("Here");
          const finalList = [];
          for (let index = 0; index < attendance.length; index++) {
            const element = attendance[index];
            if (
              element.employee.admissionNo
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              element.employee.route.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              element.employee.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              element.employee.phone
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              element.employee.email
                .toLowerCase()
                .includes(search.toLowerCase())
            ) {
              finalList.push(element);
            }
          }
          res.json(finalList);
        } else {
          res.json(attendance);
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
      }
    }
  } else {
    try {
      const attendance = await Attendance.find({
        entryTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
        userID: id,
      }).populate({
        path: "employee",
        populate: [
          {
            path: "route",
            model: "Route",
          },
          {
            path: "parent",
            model: "Parent",
          },
          {
            path: "bus",
            model: "Bus",
          },
          {
            path: "department",
            model: "Department",
          },
          {
            path: "designation",
            model: "Designation",
          },
        ],
      });
      if (search != "") {
        console.log("Here");
        const finalList = [];
        for (let index = 0; index < attendance.length; index++) {
          const element = attendance[index];
          if (
            element.employee.admissionNo
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            element.employee.route.name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            element.employee.name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            element.employee.phone
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            element.employee.email.toLowerCase().includes(search.toLowerCase())
          ) {
            finalList.push(element);
          }
        }
        res.json(finalList);
      } else {
        res.json(attendance);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
});

router.post("/mobile-parent/get-attendance", async (req, res) => {
  console.log("HERE");
  const { startDate, endDate, parentID } = req.body;
  try {
    const attendance = await Attendance.find({
      entryTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate({
      path: "employee",
      populate: [
        {
          path: "route",
          model: "Route",
        },
        {
          path: "parent",
          model: "Parent",
        },
        {
          path: "bus",
          model: "Bus",
        },
      ],
    });
    const resultList = [];
    console.log(attendance);
    console.log(parentID);
    for (let index = 0; index < attendance.length; index++) {
      const element = attendance[index];
      if (element.employee.phone == parentID) {
        resultList.push(element);
      }
    }
    res.json(resultList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/today-attendance-count/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
      0,
      0,
      0,
      -1
    );
    const count = await Attendance.countDocuments({
      entryTime: { $gte: startOfDay, $lte: endOfDay },
      userID: id,
    }).exec();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/today-attendance-count-exited/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
      0,
      0,
      0,
      -1
    );
    const count = await Attendance.countDocuments({
      exitTime: { $gte: startOfDay, $lte: endOfDay },
      userID: id,
    }).exec();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = routes;
