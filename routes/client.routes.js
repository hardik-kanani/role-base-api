const express = require("express");
const clientController = require("../controllers/client.controller");
const { verifyToken, roleMiddleware } = require("../middleware/auth");
const { userValidation } = require("../validation/user.validator");
const { postValidation } = require("../validation/post.validator");
const router = express.Router();

router.post("/register", userValidation, clientController.register);

router.post(
  "/post",
  verifyToken,
  roleMiddleware(["client"]),
  postValidation,
  clientController.createPost
);

router.get(
  "/post/notes",
  verifyToken,
  roleMiddleware(["client"]),
  clientController.getPostWithNotes
);

module.exports = router;
