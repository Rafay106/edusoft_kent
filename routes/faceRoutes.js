const {
  uploadLabeledImages,
  getDescriptorsFromDB,
} = require("../utils/fn_common");

const router = require("express").Router();

router.post("/post-face", upload.single("photo"), async (req, res) => {
  const label = req.body.label;
  const File1 = req.file ? req.file.path : "";
  let result = await uploadLabeledImages([File1], label);
  if (result) {
    res.json({ message: "Face data stored successfully" });
  } else {
    res.json({ message: "Something went wrong, please try again." });
  }
});

router.post("/check-face", upload.single("photo"), async (req, res) => {
  const File1 = req.file ? req.file.path : "";
  let result = await getDescriptorsFromDB(File1);
  res.json({ result });
});

module.exports = router;
