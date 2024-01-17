const router = require("express").Router();
const { login, mobileLogin } = require("../controllers/loginController");

router.post("/", login);
router.post("/mobile", mobileLogin);

module.exports = router;
