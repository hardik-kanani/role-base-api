const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { signInValidation } = require("../validation/auth.validator");

router.get("/verify/:token", authController.verifyEmail);
router.post("/login", signInValidation, authController.login);

module.exports = router;
