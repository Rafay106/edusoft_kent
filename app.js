// require('@tensorflow/tfjs-node');
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyparser = require("body-parser");
const fs = require("fs");
const app = express();
const request = require("request");
const multer = require("multer");
const path = require("path");
const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
const sdk = require("api")("@onesignal/v9.0#9qqu7a46lli0f9a45");
const canvas = require("canvas");
const cron = require("node-cron");
const axios = require("axios");
const compression = require("compression");
const moment = require("moment");

faceapi.env.monkeyPatch({ Canvas, Image });
const port = 3000;
const secret = "THISISMYSECRETKEY";
const MAX_DEPTH = 5;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const upload = multer({ storage: storage });

app.set("view engine", "jade");

app.use(compression({ level: 9 }));

app.use(require("./routes/allRoutes"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
