require("dotenv").config();
require("./config/db")();
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const CORS = require("cors");
const compression = require("compression");
const cron = require("node-cron");
const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
const { PORT } = process.env;

const SERVICE = require("./utils/services");

const { LoadModels } = require("./utils/fn_common");
const { errorHandler } = require("./middlewares/errorMiddleware");
const { protect } = require("./middlewares/authMiddleware");
const asyncHandler = require("express-async-handler");
const { authenticateToken } = require("./utils/fn_jwt.js");

const app = express();

app.use(CORS({ origin: "*" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,PUT,POST,PATCH,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "build")));
app.use("/uploads", express.static(__dirname + "/uploads"));

cron.schedule("*/5 * * * * *", SERVICE.notifyBusBoarding);

cron.schedule("* */1 * * * *", SERVICE.job1);

cron.schedule("* */30 * * * *", SERVICE.job2);

cron.schedule("*/5 * * * * *", () => {
  fetchData();
});

cron.schedule("*/10 * * * * *", () => {
  fetchDataBus();
  console.log("Cron job executed at:", new Date().toISOString());
});

faceapi.env.monkeyPatch({ Canvas, Image });
LoadModels();

app.use("/login", require("./routes/loginRoutes"));
app.use("/admin-panel", require("./routes/adminPanel/adminPanelRoutes.js"));
app.use("/master-data", protect, require("./routes/masterDataRoutes.js"));
app.use("/", require("./routes/employeeRoutes.js"));

app.all(
  "*",
  asyncHandler((req, res) => {
    throw new Error("Not Found");
  })
);

app.use(errorHandler);
app.listen(PORT, () =>
  console.log(`Edusoft Attendance running at port ${PORT}`)
);
