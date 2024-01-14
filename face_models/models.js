

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  mobile: String,
  type: String,
});

const deviceSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

const locationSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  userID: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const busTrackSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deviceID: {
    type: String,
    ref: "Device",
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

const companySchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userID: { type: String, required: true },
});

const departmentSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: { type: String, required: true },
  name: { type: String, required: true },
});

const designationSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  department: { type: String, required: true },
  name: { type: String, required: true },
});

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  joining: { type: Date, required: true },
  rfidID: { type: String, default: "" },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Route",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Department",
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Designation",
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Parent",
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Bus",
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Device",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adhaarNo: { type: String },
  admissionNo: { type: String, required: true },
  gender: { type: String },
  birth: { type: String },
  photoUrl: { type: String },
  numbers: [Number],
});

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employee",
  },
  type: {
    type: String,
  },
  entryTime: { type: Date, index: true, unique: true, sparse: true },
  exitTime: { type: Date, index: true, unique: true, sparse: true },
  deviceID: {
    type: String,
    ref: "Device",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const attendanceEventSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentID: {
    type: String,
    ref: "Employee",
  },
  deviceID: {
    type: String,
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
    index: true,
    unique: true,
    sparse: true,
  },
});

const notificationEventSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    ref: "User",
    required: true,
  },
});

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const busSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Staff",
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Device",
  },
  route: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Route",
    },
  ],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    ref: "Bus",
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
      ref: "Employee",
    },
  ],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

const User = mongoose.model("User", userSchema);
const Location = mongoose.model("Location", locationSchema);
const Company = mongoose.model("Company", companySchema);
const Department = mongoose.model("Department", departmentSchema);
const Designation = mongoose.model("Designation", designationSchema);
const Employee = mongoose.model("Employee", employeeSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const FaceModel = mongoose.model("Face", faceSchema);
const Device = mongoose.model("Device", deviceSchema);
const Staff = mongoose.model("Staff", staffSchema);
const Bus = mongoose.model("Bus", busSchema);
const Parent = mongoose.model("Parent", parentSchema);
const Route = mongoose.model("Route", routeSchema);
const BusTrack = mongoose.model("BusTrack", busTrackSchema);
const AttendanceEvent = mongoose.model(
  "AttendanceEvent",
  attendanceEventSchema
);
const NotificationEvent = mongoose.model(
  "NotificationEvent",
  notificationEventSchema
);
