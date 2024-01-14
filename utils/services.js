const asyncHandler = require("express-async-handler");
const {
  AttendanceEvent,
  Device,
  Bus,
  NotificationEvent,
} = require("../models/allModels");
const { default: axios } = require("axios");
const { ONESIGNAL_URL, ONESIGNAL_AUTH, ONESIGNAL_APP_ID } = process.env;

const notifyBusBoarding = asyncHandler(async () => {
  const result = await AttendanceEvent.find({ status: -1 })
    .populate({
      path: "studentID",
      populate: [
        { path: "route", model: "routes" },
        { path: "department", model: "departments" },
        { path: "designation", model: "designations" },
        { path: "parent", model: "parents" },
        { path: "bus", model: "buses" },
        { path: "device", model: "devices" },
      ],
    })
    .exec();

  const config = {
    headers: {
      Authorization: ONESIGNAL_AUTH,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  for (const element of result) {
    const initialTime = element.time;
    if (element.deviceID == element.studentID.device.deviceID) {
      const resultDevice = await Device.findOne({
        deviceID: element.deviceID,
      });

      const resultBus = await Bus.findOne({ device: resultDevice._id });

      const message = `Your child ${element.studentID.name} (${
        element.studentID.department.name
      } - ${element.studentID.designation.name}) has entered the school bus (${
        resultBus.name
      }) at ${initialTime.toLocaleString()}.`;

      const body = {
        app_id: ONESIGNAL_APP_ID,
        // "included_segments": [
        //   "Subscribed Users"
        // ],
        include_external_user_ids: [
          // element.studentID.parent._id,
          element.studentID._id,
          element._id,
          "63fa53d4dd45a01f493da24f",
          "64be2d8a020ed09512b25112",
          "64bf66b2130f606ef124dcc5",
          "64bfb47c76d84007d70db963",
        ],
        contents: { en: message },
        name: "INTERNAL_CAMPAIGN_NAME",
      };

      axios.post(ONESIGNAL_URL, body, config);

      await AttendanceEvent.findByIdAndUpdate(element.id, {
        status: 1,
        message,
      }).exec();
    } else {
      console.log(element.deviceID);

      const resultDevice = await Device.findOne({
        deviceID: element.deviceID,
      }).exec();

      const resultBus = await Bus.findOne({
        device: resultDevice._id,
      }).exec();

      const message = `Your child ${element.studentID.name} (${
        element.studentID.department.name
      } - ${
        element.studentID.designation.name
      }) has entered in a wrong school bus (${resultBus.name}) instead of ${
        element.studentID.device.deviceName
      } at ${initialTime.toLocaleString()}.`;

      const body = {
        app_id: ONESIGNAL_APP_ID,
        // "included_segments": [
        //   "Subscribed Users"
        // ],
        include_external_user_ids: [
          // element.studentID.parent._id,
          element.studentID._id,
          element._id,
          "63fa53d4dd45a01f493da24f",
          "64be2d8a020ed09512b25112",
          "64bf66b2130f606ef124dcc5",
          "64bfb47c76d84007d70db963",
        ],
        contents: {
          en: message,
        },
        name: "INTERNAL_CAMPAIGN_NAME",
      };

      await axios.post(ONESIGNAL_URL, body, config);

      await AttendanceEvent.findByIdAndUpdate(element.id, {
        status: 1,
        message,
      }).exec();
    }
  }
});

const job1 = asyncHandler(async () => {
  const result = await NotificationEvent.find({ status: -1 }).exec();

  for (const element of result) {
    const config = {
      headers: {
        Authorization: ONESIGNAL_AUTH,
        accept: "application/json",
        "content-type": "application/json",
      },
    };

    const body = {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [
        "63fa53d4dd45a01f493da24f",
        "64be2d8a020ed09512b25112",
        "64bf66b2130f606ef124dcc5",
        "64bfb47c76d84007d70db963",
      ],
      contents: { en: element.message },
      name: "INTERNAL_CAMPAIGN_NAME",
    };

    await axios.post(ONESIGNAL_URL, body, config);

    await NotificationEvent.findByIdAndUpdate(element.id, {
      status: 1,
    }).exec();
  }
});

const job2 = asyncHandler(async () => {
  // Get the current time
  const currentTime = new Date();

  // Get the current time's hour and minute
  const currentHour = currentTime.getUTCHours();
  const currentMinute = currentTime.getUTCMinutes();

  // Calculate the remaining time until 12 AM
  const remainingHours = 23 - currentHour;
  const remainingMinutes = 60 - currentMinute;

  // Check if there's less than 1 hour left until 12 AM
  if (remainingHours === 0 && remainingMinutes < 60) {
    const result = await Bus.find({ replacement: "true" }).exec();

    for (const element of result) {
      await Bus.findByIdAndUpdate(element.id, { replacement: "false" }).exec();
    }
  }
});

const apiEndpoint = "https://www.speedotrack.in/func/fn_rilogbook_custom.php";

// Function to fetch and parse data
const fetchData = asyncHandler(async () => {
  // Load data from the API endpoint
  const response = await axios.get(apiEndpoint, {
    params: {
      cmd: "load_rilogbook_list",
      drivers: true,
      passengers: true,
      trailers: true,
      rows: 10000,
      page: 1,
      sidx: "rilogbook_id",
      sord: "asc",
      rid: fs.readFileSync("lastElementId.txt", "utf-8") || 0,
    },
  });
  console.log("HERE1");
  const data = response.data;

  console.log("HERE2");
  for (const entry of data.rows) {
    // Extract RFID ID from cell index 2
    try {
      const rfidID = entry.cell[2];
      const deviceName = entry.cell[1];
      // Find employee in the Employee collection based on RFID ID
      const employee = await Employee.findOne({ rfidID });
      const device = await Device.findOne({ deviceName });
      if (employee) {
        console.log("HERE3");
        const employeeId = employee._id;
        let givenDate = new Date(entry.cell[0]);

        // Adding 5 hours and 30 minutes
        givenDate.setHours(givenDate.getHours() + 5);
        givenDate.setMinutes(givenDate.getMinutes() + 30);
        const timestamp = givenDate;
        const deviceID = device.deviceID;
        const userID = "64bf66b2130f606ef124dcc5";

        console.log("HERE4");
        console.log(
          `Employee Found - RFID ID: ${rfidID}, Employee Name: ${employee.name}, Other Info: ${employee._id}`
        );
        // console.log(employee.name);
        if (employeeId) {
          try {
            if (!employee) {
              console.log("HERE7");
              console.log("Attendance recorded successfully");
              return;
            }

            console.log("HERE5");
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
                console.log("HERE6");
                const differenceMs = timestamp - latestEntry.exitTime;
                const differenceMinutes = differenceMs / (1000 * 60);
                if (differenceMinutes > 2) {
                  storeAttendance = new Attendance({
                    type,
                    employee: employeeId,
                    deviceID: deviceID,
                    userID,
                    entryTime: timestamp,
                    exitTime: timestamp,
                  });
                  await storeAttendance.save(async (err) => {
                    if (err) {
                      console.log("HERE8");
                      console.log("Attendance recorded successfully");
                      return;
                    }
                    notification = new AttendanceEvent({
                      studentID: employeeId,
                      type: type,
                      userID,
                      deviceID: deviceID,
                      status: -1,
                      time: timestamp,
                    });
                    await notification.save((err) => {
                      if (err) {
                        console.log("HERE9");
                        console.log("Attendance recorded successfully");
                        return;
                      }

                      console.log("HERE23");

                      console.log("Attendance recorded successfully");
                    });
                  });
                }
              } else {
                console.log("HERE10");
                console.log("Attendance recorded successfully");
              }
            } else {
              type = "exit";

              console.log("HERE11");
              const differenceMs = timestamp - attendance.entryTime;
              const differenceMinutes = differenceMs / (1000 * 60);
              if (differenceMinutes > 2) {
                attendance.exitTime = timestamp;
                attendance.type = "exit";

                console.log("HERE12");
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
                    time: timestamp,
                  });

                  console.log("HERE13");
                  await notification.save((err) => {
                    if (err) {
                      res.status(500).send("Error saving attendance record");
                      return;
                    }
                    console.log("Attendance recorded successfully");
                  });
                });
              } else {
                console.log("HERE14");
                console.log("Attendance recorded successfully");
              }
            }
          } catch (e) {
            console.log("HERE15");
          }
        } else {
          console.log("HERE16");
          console.log("Attendance recorded successfully");
        }
      } else {
        console.log("HERE17");
        console.log(`Employee Not Found - RFID ID: ${rfidID}`);
      }
    } catch (error) {
      console.log("HERE20");
      console.error("Error fetching or parsing data:", error.message);
    }
  }

  // Extract the last element's ID
  const lastElementId = data.rows[data.rows.length - 1].id;

  // Save the ID to a file
  fs.writeFileSync("lastElementId.txt", lastElementId, "utf-8");

  console.log(`Last element ID saved: ${lastElementId}`);
});

const addHoursAndMinutes = (date, hours, minutes) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

// Function to fetch and parse data from the endpoint
const fetchDataBus = asyncHandler(async () => {
  const response = await axios.get(
    "https://www.speedotrack.in/api/api.php?api=user&ver=1.0&key=6DBC43AC16B9126419E52DEA3753EB30&cmd=OBJECT_GET_LOCATIONS,*"
  );
  const data = response.data;

  // Process and update each data entry in the database
  for (const objectId in data) {
    const objectData = data[objectId];

    // Update the device in the database based on the 'name' key
    const updatedDevice = await Device.findOneAndUpdate(
      { deviceName: objectData.name },
      {
        $set: {
          trackerTime: addHoursAndMinutes(
            new Date(objectData.dt_tracker),
            6,
            30
          ),
          serverTime: addHoursAndMinutes(new Date(objectData.dt_server), 6, 30),
          latitude: objectData.lat,
          longitude: objectData.lng,
          speed: objectData.speed,
          angle: objectData.angle,
        },
      },
      { new: true }
    );

    if (updatedDevice) {
      console.log(
        `Device with name ${objectData.name} updated successfully. Response:`,
        updatedDevice
      );
    } else {
      console.log(`Device with name ${objectData.name} not found.`);
    }

    console.log(`Device with name ${objectData.name} updated successfully.`);
  }
});

module.exports = { notifyBusBoarding, job1, job2, fetchData, fetchDataBus };
