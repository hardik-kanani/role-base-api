const db = require("../models/db-manager");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");
const { sendEmail } = require("../services/email.service");

//**************** USER LOGIN

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const user = await db.userModel.findOne({ email });

    if (!user) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_CREDENTIALS
      );
    }

    if (!user?.is_verified) {
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const text = `Please verify your email by clicking the following link: http://localhost:3000/api/auth/verify/${verificationToken}`;
      const subject = "Email Verification";

      const isSend = await sendEmail(email, subject, text);

      if (isSend) {
        await db.userModel.findByIdAndUpdate(
          user._id,
          {
            verification_token: verificationToken,
          },
          {
            new: true,
          }
        );

        return await commonResponse(
          req,
          res,
          commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
          commonResponseType.RESPONSE_SUCCESS.TRUE,
          commonResponseType.SUCCESS_API_TOAST.LOGIN_EMAIL_SEND
        );
      } else {
        return await commonResponse(
          req,
          res,
          commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
          commonResponseType.RESPONSE_SUCCESS.FALSE,
          commonResponseType.ERROR_API_TOAST.EMAIL_SENT_ERROR
        );
      }
    } else if (user?.status === false) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_ERROR,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.DE_ACTIVE_BY_ADMIN_ERROR
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_CREDENTIALS
      );
    }

    const token = jwt.sign(
      { _id: user._id, role: user?.role, email: user?.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
      commonResponseType.RESPONSE_SUCCESS.TRUE,
      commonResponseType.SUCCESS_API_TOAST.LOGIN_SUCCESS,
      user,
      token
    );
  } catch (err) {
    console.log("Getting error while user login :", err);
    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** EMAIL VERIFICATION

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.userModel.findOne({
      email: decoded?.email,
    });

    if (!user) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_TOKEN
      );
    }

    await db.userModel.findByIdAndUpdate(
      user._id,
      {
        is_verified: true,
      },
      {
        new: true,
      }
    );

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_SUCCESS,
      commonResponseType.RESPONSE_SUCCESS.TRUE,
      commonResponseType.SUCCESS_API_TOAST.EMAIL_VERIFICATION_SUCCESS
    );
  } catch (err) {
    console.log("Getting error while verify email token :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.INVALID_OR_EXPIRE_TOKEN
    );
  }
};
