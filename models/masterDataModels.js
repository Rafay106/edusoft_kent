const mongoose = require("mongoose");
const ERROR = require("../constants/errorConstants");

/************
 * Location *
 ************/

const locationSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, ERROR.IR.FIELD],
      ref: "users",
    },
    active: { type: Boolean, default: true },
    name: { type: String, required: [true, ERROR.IR.FIELD] },
    address1: { type: String, required: [true, ERROR.IR.FIELD] },
    address2: { type: String, default: "" },
    city: { type: String, required: [true, ERROR.IR.FIELD] },
    state: { type: String, required: [true, ERROR.IR.FIELD] },
    country: { type: String, required: [true, ERROR.IR.FIELD] },
    pincode: { type: String, required: [true, ERROR.IR.FIELD] },
    lat: { type: Number, default: "" },
    lon: { type: Number, default: "" },
    range: { type: String, default: "" },
  },
  { timestamps: true }
);

locationSchema.index({ admin: 1, name: 1 });

/***********
 * Company *
 ***********/

const companySchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, ERROR.IR.FIELD],
    },
    active: { type: Boolean, default: true },
    name: { type: String, required: [true, ERROR.IR.FIELD] },
    locations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, ERROR.IR.FIELD],
        ref: "locations",
      },
    ],
    email: { type: String, required: [true, ERROR.IR.FIELD] },
    phone: { type: String, required: [true, ERROR.IR.FIELD] },
    address1: { type: String, required: [true, ERROR.IR.FIELD] },
    address2: { type: String, default: "" },
    country: { type: String, required: [true, ERROR.IR.FIELD] },
    state: { type: String, required: [true, ERROR.IR.FIELD] },
    city: { type: String, required: [true, ERROR.IR.FIELD] },
    pincode: { type: String, required: [true, ERROR.IR.FIELD] },
  },
  { timestamps: true }
);

companySchema.index({ admin: 1, name: 1 }, { unique: true });

/**************
 * Department *
 **************/

const departmentSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, ERROR.IR.FIELD],
    },
    active: { type: Boolean, default: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: [true, ERROR.IR.FIELD],
    },
    name: { type: String, required: [true, ERROR.IR.FIELD] },
  },
  { timestamps: true }
);

departmentSchema.index({ admin: 1, company: 1, name: 1 }, { unique: true });

/***************
 * Designation *
 ***************/

const designationSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, ERROR.IR.FIELD],
  },
  active: { type: Boolean, default: true },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "companies",
    required: [true, ERROR.IR.FIELD],
  },
  name: { type: String, required: [true, ERROR.IR.FIELD] },
});

/*********
 * Shift *
 *********/

const shiftSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, ERROR.IR.FIELD],
    },
    active: { type: Boolean, default: true },
    accessLevel: {
      type: String,
      required: [true, ERROR.IR.FIELD],
      enum: {
        values: ["account", "location", "company"],
        message: ERROR.VALUE_NOT_SUPPORTED,
      },
    },
    name: { type: String, required: [true, ERROR.IR.FIELD] },
    type: {
      type: String,
      required: [true, ERROR.IR.FIELD],
      enum: {
        values: ["fi", "fl"], // fi: fixed, fl: flexible
        message: ERROR.VALUE_NOT_SUPPORTED,
      },
    },
    time: {
      start: { type: String, required: [true, ERROR.IR.FIELD] },
      end: { type: String, required: [true, ERROR.IR.FIELD] },
      duration: { type: Number, required: [true, ERROR.IR.FIELD] },
    },
    gracePeriod: {
      status: { type: Boolean, required: [true, ERROR.IR.FIELD] },
      start: { type: String, required: [true, ERROR.IR.FIELD] },
      end: { type: String, required: [true, ERROR.IR.FIELD] },
    },
    schedule: {
      type: String,
      required: [true, ERROR.IR.FIELD],
      enum: {
        values: ["c", "a"], // c: Continuous, a: Alternate In/Out
        message: ERROR.VALUE_NOT_SUPPORTED,
      },
    },
  },
  { timestamps: true }
);

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: [true, ERROR.IR.FIELD] },
  name: {
    first: { type: String, required: [true, ERROR.IR.FIELD] },
    last: { type: String, required: [true, ERROR.IR.FIELD] },
  },
  phone: { type: String, required: [true, ERROR.IR.FIELD] },
  email: { type: String, required: [true, ERROR.IR.FIELD] },
  active: { type: Boolean, default: true },
  joining: { type: Date, required: [true, ERROR.IR.FIELD] },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, ERROR.IR.FIELD],
    ref: "locations",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, ERROR.IR.FIELD],
    ref: "companies",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, ERROR.IR.FIELD],
    ref: "departments",
  },
  rfidID: { type: String, default: "" },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "routes",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "departments",
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "designations",
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "parents",
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "buses",
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "devices",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  adhaarNo: { type: String },
  admissionNo: { type: String, required: true },
  gender: { type: String },
  birth: { type: String },
  photoUrl: { type: String },
  numbers: [Number],
});

module.exports = {
  Location: mongoose.model("locations", locationSchema),
  Company: mongoose.model("companies", companySchema),
  Department: mongoose.model("departments", departmentSchema),
  Designation: mongoose.model("designations", designationSchema),

  Employee: mongoose.model("employees", employeeSchema),
};
