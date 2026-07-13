const express = require("express");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadDocument } = require("../controllers/document.controller");

const router = express.Router();

router.post("/", auth, upload.single("file"), uploadDocument);

module.exports = router;
