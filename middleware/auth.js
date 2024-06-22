const db = require("../models/db-manager");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");
dotenv.config();
const secret = process.env.JWT_SECRET;

//***************** VERIFY TOKEN

exports.verifyToken = async (req, res, next) => {
  try {
    if (
      req?.headers?.authorization &&
      req?.headers?.authorization?.split(" ")[0] === "Bearer"
    ) {
      const token = req?.headers?.authorization?.split(" ")[1];
      if (!token) {
        return await commonResponse(
          req,
          res,
          commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
          commonResponseType.RESPONSE_SUCCESS.FALSE,
          commonResponseType.ERROR_API_TOAST.AUTH_TOKEN_REQUIRED
        );
      }

      try {
        const decoded = jwt.verify(token, secret);

        if (decoded._id) {
          const user = await db.userModel.findById({ _id: decoded._id });

          if (user === null) {
            return await commonResponse(
              req,
              res,
              commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
              commonResponseType.RESPONSE_SUCCESS.FALSE,
              commonResponseType.ERROR_API_TOAST.UNAUTHORIZED
            );
          }
          if (user?.status === false) {
            return await commonResponse(
              req,
              res,
              commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
              commonResponseType.RESPONSE_SUCCESS.FALSE,
              commonResponseType.ERROR_API_TOAST.DE_ACTIVE_BY_ADMIN_ERROR
            );
          }
          if (user?.is_verified === false) {
            return await commonResponse(
              req,
              res,
              commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
              commonResponseType.RESPONSE_SUCCESS.FALSE,
              commonResponseType.ERROR_API_TOAST.VERIFICATION_PENDING_ERROR
            );
          } else {
            req.user = user;
            return next();
          }
        } else {
          return await commonResponse(
            req,
            res,
            commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
            commonResponseType.RESPONSE_SUCCESS.FALSE,
            commonResponseType.ERROR_API_TOAST.UNAUTHORIZED
          );
        }
      } catch (error) {
        return await commonResponse(
          req,
          res,
          commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
          commonResponseType.RESPONSE_SUCCESS.FALSE,
          commonResponseType.ERROR_API_TOAST.UNAUTHORIZED
        );
      }
    } else {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.UNAUTHORIZED
      );
    }
  } catch (err) {
    console.log("Getting error while verify access token :", err);
    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//***************** CHECK ROLE ACCESS

exports.roleMiddleware = (roles) => async (req, res, next) => {
  try {
    if (!roles.includes(req.user.role)) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_FORBIDDEN,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.ACCESS_DENIED
      );
    }
    next();
  } catch (error) {
    console.log("Getting error while check access :", err);
    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
