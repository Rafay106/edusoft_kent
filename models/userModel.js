const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ERROR = require("../constants/errorConstants");
const SERVER = require("../constants/serverConstants");

const privilegesSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: [true, ERROR.IR.FIELD],
      enum: {
        values: [SERVER.SUPER_ADMIN, SERVER.ADMIN, SERVER.MANAGER, SERVER.USER],
        message: ERROR.VALUE_NOT_SUPPORTED,
      },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: [true, ERROR.IR.FIELD] },
    email_verified: { type: Boolean, default: false },
    password: { type: String, required: [true, ERROR.IR.FIELD] },
    name: {
      first: { type: String, required: [true, ERROR.IR.FIELD] },
      mid: { type: String, default: "" },
      last: { type: String, required: [true, ERROR.IR.FIELD] },
    },
    mobile: { type: String, required: [true, ERROR.IR.FIELD] },
    role: {
      type: String,
      required: [true, ERROR.IR.FIELD],
      enum: {
        values: [SERVER.ADMIN, SERVER.EMPLOYEE, SERVER.PARENT],
        message: ERROR.VALUE_NOT_SUPPORTED,
      },
    },
    privileges: privilegesSchema,
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("users", userSchema);
module.exports = User;
