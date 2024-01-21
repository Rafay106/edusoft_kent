const mongoose = require("mongoose");
const ERROR = require("../constants/errorConstants");

const deviceSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  deviceID: { type: String, required: true },
  deviceName: { type: String, required: true },
  trackerTime: { type: Date },
  serverTime: { type: Date },
  latitude: { type: String, default: "0.0" },
  longitude: { type: String, default: "0.0" },
  speed: { type: String, default: "0" },
  angle: { type: String, default: "0" },
  status: { type: String, default: "Not Charging" },
  level: { type: String, default: "0" },
  gsm: { type: String },
});

const busTrackSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  deviceID: {
    type: String,
    ref: "devices",
  },
  trackerTime: { type: Date },
  serverTime: { type: Date },
  accuracy: { type: String, default: "0.0" },
  latitude: { type: String, default: "0.0" },
  latitude: { type: String, default: "0.0" },
  latitude: { type: String, default: "0.0" },
  latitude: { type: String, default: "0.0" },
  longitude: { type: String, default: "0.0" },
  speed: { type: String, default: "0" },
  angle: { type: String, default: "0" },
  status: { type: String, default: "Not Charging" },
  level: { type: String, default: "0" },
  gsm: { type: String },
});

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "employees",
  },
  type: {
    type: String,
  },
  entryTime: { type: Date, index: true, unique: true, sparse: true },
  exitTime: { type: Date, index: true, unique: true, sparse: true },
  deviceID: {
    type: String,
    ref: "devices",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const attendanceEventSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  studentID: { type: String, ref: "employees" },
  deviceID: { type: String },
  type: { type: String },
  status: { type: Number },
  message: { type: String },
  time: {
    type: Date,
    index: true,
    unique: true,
    sparse: true,
  },
});

const notificationEventSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  type: {
    type: String,
  },
  status: {
    type: Number,
  },
  message: {
    type: String,
  },
  time: {
    type: Date,
  },
  sendIDs: { type: String, default: "" },
  title: { type: String, default: "" },
});

const faceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },
  descriptions: {
    type: Array,
    required: true,
  },
});

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const busSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "staffs",
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "devices",
  },
  route: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "routes",
    },
  ],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  name: {
    type: String,
  },
  replacement: {
    type: String,
  },
  replacementID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "buses",
  },
  reason: {
    type: String,
  },
  notes: {
    type: String,
  },
});

const parentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
    },
  ],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

// const shiftSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   isFixed: { type: Boolean, required: true, default: true },
//   loginTime: { type: String, default: '09:00' },
//   logoutTime: { type: String, default: '17:00' },
//   duration: { type: Number, default: '08:00'},
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   employeeID: { type: String, required: true, unique: true },
//   post: { type: String, },
//   creator: { type: String, required: true, default: 'company' },
//   photoUrl: { type: String },
//   status: { type: String, required: true, default: 'out' },
//   time: { type: String },
//   lat: { type: Number },
//   lng: { type: Number },
//   battery: { type: Number },
//   charging: { type: String }
// });

module.exports = {
  Attendance: mongoose.model("attendances", attendanceSchema),
  FaceModel: mongoose.model("faces", faceSchema),
  Device: mongoose.model("devices", deviceSchema),
  Staff: mongoose.model("staffs", staffSchema),
  Bus: mongoose.model("buses", busSchema),
  Parent: mongoose.model("parents", parentSchema),
  Route: mongoose.model("routes", routeSchema),
  BusTrack: mongoose.model("bus_tracks", busTrackSchema),
  AttendanceEvent: mongoose.model("event_attendances", attendanceEventSchema),
  NotificationEvent: mongoose.model(
    "event_notifications",
    notificationEventSchema
  ),
};
