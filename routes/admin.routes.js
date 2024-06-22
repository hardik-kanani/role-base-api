const express = require("express");
const adminController = require("../controllers/admin.controller");
const { verifyToken, roleMiddleware } = require("../middleware/auth");
const { userValidation } = require("../validation/user.validator");
const router = express.Router();

//========= RECRUITERS
router.post(
  "/recruiter",
  verifyToken,
  roleMiddleware(["admin"]),
  userValidation,
  adminController.createRecruiter
);

router.put(
  "/recruiter",
  verifyToken,
  roleMiddleware(["admin"]),
  userValidation,
  adminController.updateRecruiter
);

router.delete(
  "/recruiter/:_id",
  verifyToken,
  roleMiddleware(["admin"]),
  adminController.deleteRecruiter
);

router.get(
  "/recruiter/:_id",
  verifyToken,
  roleMiddleware(["admin"]),
  adminController.getRecruiter
);

router.get(
  "/recruiters",
  verifyToken,
  roleMiddleware(["admin"]),
  adminController.recruitersList
);

//========= CLIENTS

router.post(
  "/client",
  verifyToken,
  roleMiddleware(["admin"]),
  userValidation,
  adminController.createClient
);

router.put(
  "/client",
  verifyToken,
  roleMiddleware(["admin"]),
  userValidation,
  adminController.updateClient
);

router.delete(
  "/client/:_id",
  verifyToken,
  roleMiddleware(["admin"]),
  adminController.deleteClient
);

router.get(
  "/client/:_id",
  verifyToken,
  roleMiddleware(["admin"]),
  adminController.getClient
);

router.get(
  "/clients",
  verifyToken,
  roleMiddleware(["admin"]),
  adminController.clientList
);

module.exports = router;
