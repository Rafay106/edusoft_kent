const ERROR = require("../constants/errorConstants");

const errorHandler = (err, req, res, next) => {
  console.log("Custom Error Handler:", err);

  const errObj = {
    error: err.message || ERROR.SWW,
    success: false,
    stack: process.env.NODE_ENV === "production" ? null : err.stack.split("\n"),
  };

  // if (process.env.NODE_ENV === "development") {
  //   devErrors(res, err);
  // } else if (process.env.NODE_ENV === "production") {
  //   if (err.name === "CastError") err = castErrorHandler(err);
  //   if (err.code === 11000) err = duplicateKeyErrorHandler(err)
  // }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) =>
      value.message.replace("%FIELD%", value.path)
    );

    errObj.error = message;
    return res.status(400).json(errObj);
  }

  // Duplicate Key Error
  if (err.name === "MongoServerError" && err.code === 11000) {
    const message = Object.keys(err.keyValue).map(
      (key) => `${key}: ${err.keyValue[key]} already exists!`
    );

    errObj.error = message;

    return res.status(409).json(errObj);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json(errObj);
};

module.exports = { errorHandler };
