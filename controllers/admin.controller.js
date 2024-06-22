const db = require("../models/db-manager");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");
const { sendEmail } = require("../services/email.service");
const { isObjectIdOrHexString } = require("mongoose");

//=================================================================
// ----------------------- RECRUITER ------------------------------
//=================================================================

//**************** CREATE

exports.createRecruiter = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    const existingUser = await db.userModel.findOne({ email: email });
    if (existingUser) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.EMAIL_ALREADY_EXISTS
      );
    }

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const text = `Please verify your email by clicking the following link: http://localhost:3000/api/auth/verify/${verificationToken}`;
    const subject = "Recruiter Email Verification.";

    const isSend = await sendEmail(email, subject, text);

    if (isSend) {
      const hashedPassword = await bcrypt.hash(password, 12);

      await db.userModel.create({
        first_name,
        last_name,
        email,
        role: "recruiter",
        password: hashedPassword,
        is_verified: false,
      });

      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
        commonResponseType.RESPONSE_SUCCESS.TRUE,
        commonResponseType.SUCCESS_API_TOAST.REGISTRATION_SUCCESS
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
  } catch (err) {
    console.log("Getting error while create recruiter by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** UPDATE

exports.updateRecruiter = async (req, res) => {
  try {
    const { _id, first_name, last_name, status } = req.body;

    if (!isObjectIdOrHexString(_id)) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_RECRUITER
      );
    }

    const recruiter = await db.userModel.findById(_id);

    if (recruiter === null) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_RECRUITER
      );
    }

    const updateRecruiter = await db.userModel.findByIdAndUpdate(
      _id,
      {
        first_name,
        last_name,
        status,
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
      commonResponseType.SUCCESS_API_TOAST.RECRUITER_UPDATE_SUCCESS,
      updateRecruiter
    );
  } catch (err) {
    console.log("Getting error while update recruiter by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** DELETE

exports.deleteRecruiter = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!isObjectIdOrHexString(_id)) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_RECRUITER
      );
    }

    const deleteRecruiter = await db.userModel.findByIdAndDelete(_id);

    if (deleteRecruiter) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
        commonResponseType.RESPONSE_SUCCESS.TRUE,
        commonResponseType.SUCCESS_API_TOAST.RECRUITER_DELETE_SUCCESS
      );
    } else {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_RECRUITER
      );
    }
  } catch (err) {
    console.log("Getting error while delete recruiter by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
//**************** GET

exports.getRecruiter = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!isObjectIdOrHexString(_id)) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_RECRUITER
      );
    }

    const recruiter = await db.userModel.findOne(
      { _id: _id, role: "recruiter" },
      {
        is_verified: 0,
        password: 0,
      }
    );

    if (recruiter) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
        commonResponseType.RESPONSE_SUCCESS.TRUE,
        commonResponseType.SUCCESS_API_TOAST.RECRUITER_GET_SUCCESS,
        recruiter
      );
    } else {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_RECRUITER
      );
    }
  } catch (err) {
    console.log("Getting error while fetched recruiter by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** LIST

exports.recruitersList = async (req, res) => {
  try {
    const take = Number(req.query.take) || 10;
    const page = Number(req.query.page) === 0 ? 1 : Number(req.query.page);
    const skip = Number(page - 1) * take;

    const recruiters = await db.userModel.aggregate([
      {
        $match: {
          role: "recruiter",
          $or: [
            {
              first_name: {
                $regex: req.query?.searchStr || "",
                $options: "i",
              },
            },
            {
              last_name: {
                $regex: req.query?.searchStr || "",
                $options: "i",
              },
            },
            {
              email: {
                $regex: req.query?.searchStr || "",
                $options: "i",
              },
            },
          ],
        },
      },
      {
        $sort: {
          email: 1,
        },
      },

      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: skip }, { $limit: take }],
        },
      },
    ]);

    const metadata = recruiters[0].metadata[0];
    const totalCount = metadata ? metadata.totalCount : 0;

    const totalPages = Math.ceil(totalCount / take);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
      commonResponseType.RESPONSE_SUCCESS.TRUE,
      commonResponseType.SUCCESS_API_TOAST.RECRUITER_GET_SUCCESS,
      {
        recruiters: recruiters[0].data,
        count: totalCount,
        currentPage: page,
        nextPage: nextPage,
        prevPage: prevPage,
      }
    );
  } catch (err) {
    console.log("Getting error while fetch all recruiters:", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//=================================================================
//--------------------- CLIENT ------------------------------------
//=================================================================

exports.createClient = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    const existingUser = await db.userModel.findOne({ email: email });
    if (existingUser) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.EMAIL_ALREADY_EXISTS
      );
    }

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const text = `Please verify your email by clicking the following link: http://localhost:3000/api/auth/verify/${verificationToken}`;
    const subject = "Client Email Verification.";

    const isSend = await sendEmail(email, subject, text);

    if (isSend) {
      const hashedPassword = await bcrypt.hash(password, 12);

      await db.userModel.create({
        first_name,
        last_name,
        email,
        role: "client",
        password: hashedPassword,
        is_verified: false,
      });

      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
        commonResponseType.RESPONSE_SUCCESS.TRUE,
        commonResponseType.SUCCESS_API_TOAST.REGISTRATION_SUCCESS
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
  } catch (err) {
    console.log("Getting error while create client by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** UPDATE

exports.updateClient = async (req, res) => {
  try {
    const { _id, first_name, last_name, status } = req.body;

    if (!isObjectIdOrHexString(_id)) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_CLIENT
      );
    }

    const client = await db.userModel.findById(_id);

    if (client === null) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_CLIENT
      );
    }

    const updateClient = await db.userModel.findByIdAndUpdate(
      _id,
      {
        first_name,
        last_name,
        status,
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
      commonResponseType.SUCCESS_API_TOAST.CLIENT_UPDATE_SUCCESS,
      updateClient
    );
  } catch (err) {
    console.log("Getting error while update client by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** DELETE

exports.deleteClient = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!isObjectIdOrHexString(_id)) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_CLIENT
      );
    }

    const deleteClient = await db.userModel.findByIdAndDelete(_id);

    if (deleteClient) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
        commonResponseType.RESPONSE_SUCCESS.TRUE,
        commonResponseType.SUCCESS_API_TOAST.CLIENT_DELETE_SUCCESS
      );
    } else {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_CLIENT
      );
    }
  } catch (err) {
    console.log("Getting error while delete client by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** GET

exports.getClient = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!isObjectIdOrHexString(_id)) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_CLIENT
      );
    }

    const client = await db.userModel.findOne(
      { _id: _id, role: "client" },
      {
        is_verified: 0,
        password: 0,
      }
    );

    if (client) {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
        commonResponseType.RESPONSE_SUCCESS.TRUE,
        commonResponseType.SUCCESS_API_TOAST.CLIENT_GET_SUCCESS,
        client
      );
    } else {
      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        commonResponseType.ERROR_API_TOAST.INVALID_RECRUITER
      );
    }
  } catch (err) {
    console.log("Getting error while fetched client by admin :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
//**************** LIST

exports.clientList = async (req, res) => {
  try {
    const take = Number(req.query.take) || 10;
    const page = Number(req.query.page) === 0 ? 1 : Number(req.query.page);
    const skip = Number(page - 1) * take;

    const clients = await db.userModel.aggregate([
      {
        $match: {
          role: "client",
          $or: [
            {
              first_name: {
                $regex: req.query?.searchStr || "",
                $options: "i",
              },
            },
            {
              last_name: {
                $regex: req.query?.searchStr || "",
                $options: "i",
              },
            },
            {
              email: {
                $regex: req.query?.searchStr || "",
                $options: "i",
              },
            },
          ],
        },
      },
      {
        $sort: {
          email: 1,
        },
      },

      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: skip }, { $limit: take }],
        },
      },
    ]);

    const metadata = clients[0].metadata[0];
    const totalCount = metadata ? metadata.totalCount : 0;

    const totalPages = Math.ceil(totalCount / take);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
      commonResponseType.RESPONSE_SUCCESS.TRUE,
      commonResponseType.SUCCESS_API_TOAST.CLIENT_GET_SUCCESS,
      {
        clients: clients[0].data,
        count: totalCount,
        currentPage: page,
        nextPage: nextPage,
        prevPage: prevPage,
      }
    );
  } catch (err) {
    console.log("Getting error while fetch all clients:", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
