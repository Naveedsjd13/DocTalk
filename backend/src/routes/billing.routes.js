const express = require("express");
const auth = require("../middleware/auth.middleware");
const { getPlan, upgrade } = require("../controllers/billing.controller");

const router = express.Router();

router.get("/plan", auth, getPlan);
router.post("/upgrade", auth, upgrade);

module.exports = router;
