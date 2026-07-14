const express = require("express");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const {
  uploadDocument,
  getDocumentFile,
  listDocuments,
  getDocument,
  updateDocument,
  trashDocument,
  restoreDocument,
  permanentDeleteDocument,
} = require("../controllers/document.controller");

const router = express.Router();

router.post("/", auth, upload.single("file"), uploadDocument);
router.get("/", auth, listDocuments);
router.get("/:id", auth, getDocument);
router.get("/:id/file", auth, getDocumentFile);
router.patch("/:id", auth, updateDocument);
router.delete("/:id", auth, trashDocument);
router.post("/:id/restore", auth, restoreDocument);
router.delete("/:id/permanent", auth, permanentDeleteDocument);

module.exports = router;
