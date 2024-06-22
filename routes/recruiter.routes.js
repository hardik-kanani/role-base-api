const express = require("express");
const recruiterController = require("../controllers/recruiter.controller");
const { verifyToken, roleMiddleware } = require("../middleware/auth");
const { noteValidation } = require("../validation/note.validator");
const router = express.Router();

router.get(
  "/posts",
  verifyToken,
  roleMiddleware(["recruiter"]),
  recruiterController.getAssignedPosts
);

router.post(
  "/note",
  verifyToken,
  roleMiddleware(["recruiter"]),
  noteValidation,
  recruiterController.addNote
);

module.exports = router;
