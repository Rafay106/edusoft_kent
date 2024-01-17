const mongoose = require("mongoose");
const ERROR = require("../constants/errorConstants");

const employeeUnitSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ["employee", "mobile"],
        message: ERROR.VALUE_NOT_SUPPORTED,
      },
      required: [true, ERROR.IS_REQ],
    },
    qty: { type: Number, required: [true, ERROR.IS_REQ] },
    price: { type: Number, required: [true, ERROR.IS_REQ] },
  },
  { versionKey: false }
);

const subsPlanSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, ERROR.IS_REQ],
  },
  type: {
    type: String,
    enum: {
      values: ["b", "a"], // b: basic | a: advance
      message: "{VALUE} is not supported!",
    },
    required: [true, ERROR.IS_REQ],
  },
  startDate: { type: Date, required: [true, ERROR.IS_REQ] },
  endDate: { type: Date, required: [true, ERROR.IS_REQ] },
  renewDate: { type: Date, required: [true, ERROR.IS_REQ] },
  payCycle: {
    type: String,
    enum: {
      values: ["m", "y"], // m: monthly | y: yearly
      message: "{VALUE} is not supported!",
    },
    required: [true, ERROR.IS_REQ],
  },
  employee: {
    units: { type: Number, require: [true, ERROR.IS_REQ] },
    qty: { type: Number, require: [true, ERROR.IS_REQ] },
  },
  mobile: {
    units: { type: Number, require: [true, ERROR.IS_REQ] },
    qty: { type: Number, require: [true, ERROR.IS_REQ] },
  },
});

const subsOrderSchema = new mongoose.Schema({}, { versionKey: false });

// const subsPaymentSchema = new mongoose.Schema({}, { versionKey: false });

module.exports = {
  EmployeeUnit: mongoose.model("subsciption_employee_unit", employeeUnitSchema),
  Plan: mongoose.model("subsciption_plan", subsPlanSchema),
  Order: mongoose.model("subsciption_order", subsOrderSchema),
};
