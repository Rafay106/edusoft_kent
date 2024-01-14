const { authenticateToken } = require("../utils/fn_common");

const router = require("express").Router();

router.get("/send-push", async (req, res) => {
  const result = await AttendanceEvent.find({ status: -1 })
    .populate("studentID")
    .exec();
  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    const options = {
      method: "POST",
      url: "https://onesignal.com/api/v1/notifications",
      headers: {
        Authorization: "Basic YjcxY2YxMmUtMTYzNi00ZmMxLTgxNGUtODFjOTUxZThjMzcx",
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        app_id: "64726b7f-6e76-45b9-8748-6bacbe8a5533",
        included_segments: ["Subscribed Users"],
        contents: {
          en: `Your child ${element.studentID.name} has ${
            element.type == "entry" ? "entered" : "exited"
          } the school bus at ${element.time.toLocaleString()}.`,
        },
        name: "INTERNAL_CAMPAIGN_NAME",
      }),
    };
    await request(options, async function (error, response) {
      if (error) throw new Error(error);
      await AttendanceEvent.findByIdAndUpdate(element.id, { status: 1 }).exec();
    });
  }
});

function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

router.get("/invalid-photo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ userID: id })
      .populate(["department", "designation", "bus"])
      .lean()
      .select([
        "name",
        "phone",
        "department",
        "designation",
        "bus",
        "admissionNo",
        "photoUrl",
      ]);
    const noImage = [];
    const i = 0;
    for (let index = 0; index < employees.length; index++) {
      const element = employees[index];
      element.department = element.department ? element.department.name : "";
      element.designation = element.designation ? element.designation.name : "";
      element.bus = element.bus ? element.bus.name : "";
      await axios
        .head("http://attendance.edusoft.in/" + element.photoUrl)
        .then((response) => {})
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            noImage.push(element);
          } else {
            console.error("An error occurred:", error.message);
          }
        });
    }
    console.log(i);
    res.json(noImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get('/mobile/get-employees/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const employees = await Employee.find({ userID: id }).populate(['route', 'parent', 'bus', 'device', 'designation', 'department']).lean();
//     res.json(employees);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.post("/mobile/get-employees", async (req, res) => {
  const { id, page, limit, sort, search } = req.body;
  const currentPage = page ? parseInt(page, 10) : 1;
  const resultsPerPage = limit ? parseInt(limit, 10) : 10;
  const sortField = sort === "asc" ? "name" : sort === "desc" ? "-name" : null; // Sorting by name

  try {
    const skip = (currentPage - 1) * resultsPerPage;

    let query = { userID: id };
    if (search) {
      // Add a search condition to the query to match against employee names
      query.name = { $regex: new RegExp(search, "i") }; // Case-insensitive search
    }

    const employees = await Employee.find(query)
      .populate([
        "route",
        "parent",
        "bus",
        "device",
        "designation",
        "department",
      ])
      .sort(sortField)
      .skip(skip)
      .limit(resultsPerPage)
      .lean();

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/api/accuracy-check", async (req, res) => {
  const { userID } = req.body;
  try {
    res.json({ accuracy: 63, detection: 0, quality: 0, distance: 0.8 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.post('/post-attendance', async (req, res) => {
//   const { employeeId, timestamp, deviceID } = req.body;
//   Employee.findById(employeeId, async (err, employee) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Error finding employee');
//       return;
//     }
//     if (!employee) {
//       res.status(404).send('Employee not found');
//       return;
//     }
//     Attendance.findOne({ employee: employeeId, exitTime: null }, async (err, attendance) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send('Error finding attendance record');
//         return;
//       }
//       const type = 'entry';
//       if (!attendance) {
//         const latestEntry = await Attendance.findOne({ employee: employeeId, exitTime: new Date(timestamp), })
//           .sort({ exitTime: -1 }).exec();
//         if (latestEntry) {
//           const differenceMs = new Date(timestamp) - latestEntry.exitTime;
//           const differenceMinutes = differenceMs / (1000 * 60);
//           if (differenceMinutes > 10) {
//             attendance = new Attendance({
//               employee: employeeId,
//               deviceID: deviceID,
//               entryTime: new Date(timestamp),
//             });
//             await attendance.save(async (err) => {
//               if (err) {
//                 console.error(err);
//                 res.status(500).send('Error saving attendance record');
//                 return;
//               }
//               notification = new AttendanceEvent({
//                 studentID: employeeId,
//                 type: type,
//                 status: -1,
//                 time: new Date(timestamp)
//               });
//               await notification.save((err) => {
//                 if (err) {
//                   console.error(err);
//                   res.status(500).send('Error saving attendance record');
//                   return;
//                 }
//                 res.send('Attendance recorded successfully');
//               });
//             });
//           }
//         } else {
//           attendance = new Attendance({
//             employee: employeeId,
//             deviceID: deviceID,
//             entryTime: new Date(timestamp),
//           });
//           await attendance.save(async (err) => {
//             if (err) {
//               console.error(err);
//               res.status(500).send('Error saving attendance record');
//               return;
//             }
//             notification = new AttendanceEvent({
//               studentID: employeeId,
//               type: type,
//               status: -1,
//               time: new Date(timestamp)
//             });
//             await notification.save((err) => {
//               if (err) {
//                 console.error(err);
//                 res.status(500).send('Error saving attendance record');
//                 return;
//               }
//               res.send('Attendance recorded successfully');
//             });
//           });
//         }
//       } else {
//         type = 'exit';
//         const differenceMs = new Date(timestamp) - attendance.entryTime;
//         const differenceMinutes = differenceMs / (1000 * 60);
//         if (differenceMinutes > 10) {
//           attendance.exitTime = new Date(timestamp);

//           await attendance.save(async (err) => {
//             if (err) {
//               console.error(err);
//               res.status(500).send('Error saving attendance record');
//               return;
//             }
//             notification = new AttendanceEvent({
//               studentID: employeeId,
//               type: type,
//               status: -1,
//               time: new Date(timestamp)
//             });
//             await notification.save((err) => {
//               if (err) {
//                 console.error(err);
//                 res.status(500).send('Error saving attendance record');
//                 return;
//               }
//               res.send('Attendance recorded successfully');
//             });
//           });
//         }
//       }
//     });
//   });
// });

router.get("/total-employee-count", async (req, res) => {
  try {
    const count = await Employee.countDocuments().exec();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/bus-tracks", async (req, res) => {
  console.log(req.body);
  const {
    latitude,
    longitude,
    speed,
    angle,
    trackerTime,
    deviceID,
    userID,
    status,
    level,
  } = req.body;
  try {
    const bus = await Device.findOne({ deviceID: deviceID });
    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }
    bus.latitude = latitude;
    bus.longitude = longitude;
    bus.speed = speed;
    bus.userID = userID;
    bus.angle = angle;
    bus.trackerTime = trackerTime;
    bus.status = status;
    bus.level = level;
    await bus.save();
    const busTrack = new BusTrack(req.body);
    busTrack.save((err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(201).send("Bus track record created successfully");
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/api/bus-tracks/:id", async (req, res) => {
  const { id } = req.params;
  BusTrack.find({ userID: id }, (err, busTracks) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(busTracks);
    }
  });
});

router.get("/mobile-parent/track-bus/:id", async (req, res) => {
  try {
    const result = await Employee.find({ phone: req.params.id }).populate(
      "device"
    );
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: "An error occurred.", success: false });
  }
});

router.get("/mobile-parent/all-track-bus/:id", async (req, res) => {
  try {
    const result = await Bus.find({ parent: req.params.id }).populate([
      "device",
      "staff",
    ]);
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: "An error occurred.", success: false });
  }
});

router.post("/mobile-parent/notifications/:id", async (req, res) => {
  try {
    const result = await Employee.find({ phone: req.params.id });
    const ids = [];
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      ids.push(element._id);
    }
    const attendance = await AttendanceEvent.find({
      studentID: { $in: ids },
    }).sort({ time: -1 });

    const results = [];

    for (let index = 0; index < attendance.length; index++) {
      const element = attendance[index];
      for (let j = 0; j < result.length; j++) {
        if (element.studentID == result[j]._id) {
          element.studentID = result[j];
          results.push(element);
        }
      }
    }
    res.status(201).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: "An error occurred.", success: false });
  }
});

router.post("/mobile-parent/all-notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, busID, search, page, pageSize } = req.body;

    let resultDeviceIds = [];

    if (busID !== "all" && busID !== "null" && busID !== null) {
      const busIds = busID.split(", ");
      const resultBuses = await Bus.find({ _id: { $in: busIds } }).exec();
      resultDeviceIds = resultBuses.map((element) => element.device);
    }

    const result = await Employee.find({ userID: id }).populate([
      "route",
      "parent",
      "bus",
      "department",
      "designation",
    ]);

    const attendanceQuery = {
      time: { $gte: new Date(startDate), $lte: new Date(endDate) },
      userID: id,
    };

    if (resultDeviceIds.length > 0) {
      attendanceQuery.deviceID = { $in: resultDeviceIds };
    }

    const attendance = await AttendanceEvent.find(attendanceQuery).sort({
      time: -1,
    });

    const results = attendance
      .map((element) => {
        const student = result.find((r) => r._id.equals(element.studentID));
        if (student) {
          element.studentID = student;
          return element;
        }
      })
      .filter(Boolean);

    if (search) {
      const finalList = results.filter((element) => {
        const student = element.studentID;
        return (
          student.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
          student.route.name.toLowerCase().includes(search.toLowerCase()) ||
          student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.phone.toLowerCase().includes(search.toLowerCase()) ||
          student.email.toLowerCase().includes(search.toLowerCase())
        );
      });

      const paginatedResults = finalList.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      res.status(201).json({ success: true, results: paginatedResults });
    } else {
      const paginatedResults = results.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      res.status(201).json({ success: true, results: paginatedResults });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred.", success: false });
  }
});

// router.post('/mobile-parent/all-notifications/:id', async (req, res) => {
//   const { id } = req.params;
//   const { startDate, endDate, busID, search, page, pageSize } = req.body;
//   console.log(search);
//   if (busID != 'all') {
//     if (busID != null || busID != 'null') {
//       const resultBus = await Bus.find({ _id: { $in: busID.split(', ') } }).exec();
//       const resultDevice = await Device.find({ _id: { $in: resultBus.map(element => element.device) } }).exec();
//       try {
//         const result = await Employee.find({ userID: req.params.id }).populate(['route', 'parent', 'bus', 'department', 'designation']);
//         const attendance = await AttendanceEvent.find({
//           time: { $gte: new Date(startDate), $lte: new Date(endDate) },
//           deviceID: { $in: resultDevice.map(element => element.deviceID) },
//           userID: id
//         }).sort({ time: -1 });

//         // Calculate the skip value for pagination
//         const skip = (page - 1) * pageSize;

//         const results = [];
//         for (let index = 0; index < attendance.length; index++) {
//           const element = attendance[index];
//           for (let j = 0; j < result.length; j++) {
//             if (element.studentID == result[j]._id) {
//               element.studentID = result[j];
//               results.push(element);
//             }
//           }
//         }

//         if (search != '') {
//           console.log('Here');
//           const finalList = [];
//           for (let index = 0; index < results.length; index++) {
//             const element = results[index];
//             if (element.studentID.admissionNo.toLowerCase().includes(search.toLowerCase()) || element.studentID.route.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.phone.toLowerCase().includes(search.toLowerCase()) || element.studentID.email.toLowerCase().includes(search.toLowerCase())) {
//               finalList.push(element);
//             }
//           }

//           // Apply pagination to the finalList
//           const paginatedResults = finalList.slice(skip, skip + pageSize);

//           res.status(201).json({ success: true, results: paginatedResults });
//         } else {
//           // Apply pagination to the results
//           const paginatedResults = results.slice(skip, skip + pageSize);

//           res.status(201).json({ success: true, results: paginatedResults });
//         }
//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'An error occurred.', success: false });
//       }
//     }
//   } else {
//     try {
//       const result = await Employee.find({ userID: req.params.id }).populate(['route', 'parent', 'bus', 'department', 'designation']);
//       const attendance = await AttendanceEvent.find().sort({ time: -1 });

//       // Calculate the skip value for pagination
//       const skip = (page - 1) * pageSize;

//       const results = [];
//       for (let index = 0; index < attendance.length; index++) {
//         const element = attendance[index];
//         for (let j = 0; j < result.length; j++) {
//           if (element.studentID == result[j]._id) {
//             element.studentID = result[j];
//             results.push(element);
//           }
//         }
//       }

//       if (search != '') {
//         console.log('Here');
//         const finalList = [];
//         for (let index = 0; index < results.length; index++) {
//           const element = results[index];
//           if (element.studentID.admissionNo.toLowerCase().includes(search.toLowerCase()) || element.studentID.route.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.phone.toLowerCase().includes(search.toLowerCase()) || element.studentID.email.toLowerCase().includes(search.toLowerCase())) {
//             finalList.push(element);
//           }
//         }

//         // Apply pagination to the finalList
//         const paginatedResults = finalList.slice(skip, skip + pageSize);

//         res.status(201).json({ success: true, results: paginatedResults });
//       } else {
//         // Apply pagination to the results
//         const paginatedResults = results.slice(skip, skip + pageSize);

//         res.status(201).json({ success: true, results: paginatedResults });
//       }
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ error: 'An error occurred.', success: false });
//     }
//   }
// });

// router.post('/mobile-parent/all-notifications/:id', async (req, res) => {
//   const { id } = req.params;
//   const { startDate, endDate, busID, search } = req.body;
//   console.log(search);
//   if (busID != 'all') {
//     if (busID != null || busID != 'null') {
//       const resultBus = await Bus.find({ _id: { $in: busID.split(', ') } }).exec();
//       const resultDevice = await Device.find({ _id: { $in: resultBus.map(element => element.device) } }).exec();
//       try {
//         const result = await Employee.find({ userID: req.params.id }).populate(['route', 'parent', 'bus', 'department', 'designation']);
//         const attendance = await AttendanceEvent.find({
//           time: { $gte: new Date(startDate), $lte: new Date(endDate) },
//           deviceID: { $in: resultDevice.map(element => element.deviceID) },
//           userID: id
//         }).sort({ time: -1 });
//         const results = [];
//         for (let index = 0; index < attendance.length; index++) {
//           const element = attendance[index];
//           for (let j = 0; j < result.length; j++) {
//             if (element.studentID == result[j]._id) {
//               element.studentID = result[j];
//               results.push(element);
//             }
//           }
//         }
//         if (search != '') {
//           console.log('Here');
//           const finalList = [];
//           for (let index = 0; index < results.length; index++) {
//             const element = results[index];
//             if (element.studentID.admissionNo.toLowerCase().includes(search.toLowerCase()) || element.studentID.route.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.phone.toLowerCase().includes(search.toLowerCase()) || element.studentID.email.toLowerCase().includes(search.toLowerCase())) {
//               finalList.push(element);
//             }
//           }
//           res.status(201).json({ success: true, results: finalList });
//         }
//         else {
//           res.status(201).json({ success: true, results: results });
//         }
//       }
//       catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'An error occurred.', success: false });
//       }
//     }
//   } else {
//     try {
//       const result = await Employee.find({ userID: req.params.id }).populate(['route', 'parent', 'bus', 'department', 'designation']);
//       const attendance = await AttendanceEvent.find().sort({ time: -1 });
//       const results = [];
//       for (let index = 0; index < attendance.length; index++) {
//         const element = attendance[index];
//         for (let j = 0; j < result.length; j++) {
//           if (element.studentID == result[j]._id) {
//             element.studentID = result[j];
//             results.push(element);
//           }
//         }
//       }
//       if (search != '') {
//         console.log('Here');
//         const element = results[0];
//         console.log(element);
//         const finalList = [];
//         for (let index = 0; index < results.length; index++) {
//           const element = results[index];
//           if (element.studentID.admissionNo.toLowerCase().includes(search.toLowerCase()) || element.studentID.route.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.name.toLowerCase().includes(search.toLowerCase()) || element.studentID.phone.toLowerCase().includes(search.toLowerCase()) || element.studentID.email.toLowerCase().includes(search.toLowerCase())) {
//             finalList.push(element);
//           }
//         }
//         res.status(201).json({ success: true, results: finalList });
//       }
//       else {
//         res.status(201).json({ success: true, results: results });
//       }
//     }
//     catch (error) {
//       console.log(error);
//       res.status(500).json({ error: 'An error occurred.', success: false });
//     }
//   }
// });

router.post("/api/history/:id", async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, deviceID } = req.body;

  if (!startTime || !endTime) {
    return res
      .status(400)
      .json({ error: "Both startTime and endTime are required." });
  }

  try {
    const tracks = await BusTrack.find({
      userID: id,
      trackerTime: {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
      deviceID,
    });

    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.patch("/api/switch-bus/:id", async (req, res) => {
  const { id } = req.params;
  const { bus1ID, bus2ID, reason, notes } = req.body;
  try {
    const bus = await Bus.findByIdAndUpdate(
      bus1ID,
      { replacement: true, replacementID: bus2ID, reason, notes },
      { new: true }
    );
    const bus2 = await Bus.findById(bus2ID);
    notification = new NotificationEvent({
      type: "replacement",
      userID: id,
      message: `This is to inform you that ${
        bus.name
      } is not available for today due to ${reason.toLowerCase()}. Instead ${
        bus2.name
      } will be replacing the default bus for today.`,
      status: -1,
      time: new Date(),
    });
    await notification.save((err) => {
      if (err) {
        res.status(500).send("Error saving attendance record");
        return;
      }
    });
    res
      .status(201)
      .json({ success: true, error: "Bus replaced successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/api/custom-notification/:id", async (req, res) => {
  const { id } = req.params;
  const { title, message, sendIDs } = req.body;
  try {
    notification = new NotificationEvent({
      type: "custom",
      userID: id,
      title: title,
      sendIDs: sendIDs,
      message: message,
      status: -1,
      time: new Date(),
    });
    await notification.save((err) => {
      if (err) {
        res.status(500).send("Error saving attendance record");
        return;
      }
    });
    res
      .status(201)
      .json({ success: true, error: "Notification sent successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Protected resource" });
});

module.exports = router;
