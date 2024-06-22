const db = require("../models/db-manager");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");

//**************** GET ASSIGNED POSTS

exports.getAssignedPosts = async (req, res) => {
  try {
    const take = Number(req.query.take) || 10;
    const page = Number(req.query.page) === 0 ? 1 : Number(req.query.page);
    const skip = Number(page - 1) * take;

    const posts = await db.postModel.aggregate([
      { $match: { assignedTo: req.user._id } },

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
          from: "users",
          foreignField: "_id",
          localField: "createdBy",
          as: "createdBy",
        },
      },

      {
        $unwind: {
          path: "$assignedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$createdBy",
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
          createdBy: {
            _id: true,
            first_name: true,
            last_name: true,
            email: true,
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
  } catch (err) {
    console.log("Getting error while fetch assign post :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};

//**************** ADD NOTE

exports.addNote = async (req, res) => {
  const { postId, content } = req.body;

  try {
    const note = await db.noteModel.create({
      content,
      postId,
      addedBy: req.user.id,
    });

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_CREATED,
      commonResponseType.RESPONSE_SUCCESS.TRUE,
      commonResponseType.SUCCESS_API_TOAST.NOTE_ADD_SUCCESS,
      note
    );
  } catch (err) {
    console.log("Getting error while add note :", err);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
