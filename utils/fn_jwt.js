const jwt = require("jsonwebtoken");
const { SECRET } = process.env;

const generateToken = (payload) => {
  const token = jwt.sign(payload, SECRET, { expiresIn: "30d" });
  return token;
};

// Middleware for authenticating JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    console.log("user :>> ", user);
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    req.userID = user.email;
    next();
  });
};

module.exports = {
  generateToken,
  authenticateToken,
};
