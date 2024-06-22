const db = require("../models/db-manager");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");
const { sendEmail } = require("../services/email.service");

//**************** REGISTER

exports.register = async (req, res) => {
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
    console.log("Getting error while register client:", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** CREATE POST

exports.createPost = async (req, res) => {
  const { title, description, location, designation, responsibility } =
    req.body;

  try {
    const recruiters = await db.userModel.find({
      role: "recruiter",
      status: true,
      is_verified: true,
    });

    const randomRecruiter =
      recruiters[Math.floor(Math.random() * recruiters.length)];

    const post = await db.postModel.create({
      title,
      description,
      location,
      designation,
      responsibility,
      createdBy: req.user.id,
      assignedTo: randomRecruiter._id,
    });

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
      commonResponseType.RESPONSE_SUCCESS.TRUE,
      commonResponseType.SUCCESS_API_TOAST.POST_CREATE_SUCCESS,
      post
    );
  } catch (err) {
    console.log("Getting error while create post :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** GET POSTS WITH NOTES

exports.getPostWithNotes = async (req, res) => {
  try {
    const take = Number(req.query.take) || 10;
    const page = Number(req.query.page) === 0 ? 1 : Number(req.query.page);
    const skip = Number(page - 1) * take;

    const posts = await db.postModel.aggregate([
      {
        $match: { createdBy: req.user._id },
      },

      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "assignedTo",
          as: "assignedBy",
        },
      },
      {
        $lookup: {
          from: "notes",
          foreignField: "postId",
          localField: "_id",
          as: "notes",
        },
      },
      {
        $unwind: {
          path: "$assignedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          title: 1,
        },
      },
      {
        $project: {
          _id: true,
          title: true,
          description: true,
          location: true,
          designation: true,
          responsibility: true,
          assignedBy: {
            _id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
          notes: {
            _id: true,
            content: true,
            postId: true,
          },
        },
      },

      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: skip }, { $limit: take }],
        },
      },
    ]);

    const metadata = posts[0].metadata[0];
    const totalCount = metadata ? metadata.totalCount : 0;

    const totalPages = Math.ceil(totalCount / take);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
      commonResponseType.RESPONSE_SUCCESS.TRUE,
      commonResponseType.SUCCESS_API_TOAST.POST_GET_SUCCESS,
      {
        posts: posts[0].data,
        count: totalCount,
        currentPage: page,
        nextPage: nextPage,
        prevPage: prevPage,
      }
    );
  } catch (error) {
    console.log("Getting error while fetch post with notes :", error);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
