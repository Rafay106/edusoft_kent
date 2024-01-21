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
      required: [true, ERROR.IR.FIELD],
    },
    qty: { type: Number, required: [true, ERROR.IR.FIELD] },
    price: { type: Number, required: [true, ERROR.IR.FIELD] },
  },
  { versionKey: false }
);

const subsPlanSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, ERROR.IR.FIELD],
  },
  type: {
    type: String,
    enum: {
      values: ["b", "a"], // b: basic | a: advance
      message: "{VALUE} is not supported!",
    },
    required: [true, ERROR.IR.FIELD],
  },
  startDate: { type: Date, required: [true, ERROR.IR.FIELD] },
  endDate: { type: Date, required: [true, ERROR.IR.FIELD] },
  renewDate: { type: Date, required: [true, ERROR.IR.FIELD] },
  payCycle: {
    type: String,
    enum: {
      values: ["m", "y"], // m: monthly | y: yearly
      message: "{VALUE} is not supported!",
    },
    required: [true, ERROR.IR.FIELD],
  },
  employee: {
    units: { type: Number, require: [true, ERROR.IR.FIELD] },
    qty: { type: Number, require: [true, ERROR.IR.FIELD] },
  },
  mobile: {
    units: { type: Number, require: [true, ERROR.IR.FIELD] },
    qty: { type: Number, require: [true, ERROR.IR.FIELD] },
  },
});

const subsOrderSchema = new mongoose.Schema({}, { versionKey: false });

// const subsPaymentSchema = new mongoose.Schema({}, { versionKey: false });

module.exports = {
  EmployeeUnit: mongoose.model("subsciption_employee_unit", employeeUnitSchema),
  Plan: mongoose.model("subsciption_plan", subsPlanSchema),
  Order: mongoose.model("subsciption_order", subsOrderSchema),
};
