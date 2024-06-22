const Joi = require("joi");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");

//**************** CREATE AND UPDATE ARTICLE

exports.userValidation = async (req, res, next) => {
  try {
    const message = commonResponseType?.VALIDATION_API_TOAST;

    const schema = Joi.object({
      _id: Joi.string()
        .optional()
        .when(Joi.ref("$_id"), {
          is: Joi.exist(),
          then: Joi.required().messages({
            "string.empty": message.IDENTITY_NOT_EMPTY,
            "any.required": message.VALID_IDENTITY_REQUIRED,
            "string.base": message.VALID_IDENTITY_REQUIRED,
          }),
        })
        .messages({
          "string.empty": message.IDENTITY_NOT_EMPTY,
          "any.required": message.VALID_IDENTITY_REQUIRED,
          "string.base": message.VALID_IDENTITY_REQUIRED,
        }),

      first_name: Joi.string().required().messages({
        "string.empty": message.FIRST_NAME_NOT_EMPTY,
        "any.required": message.VALID_FIRST_NAME_REQUIRED,
        "string.base": message.VALID_FIRST_NAME_REQUIRED,
      }),

      last_name: Joi.string().required().messages({
        "string.empty": message.LAST_NAME_NOT_EMPTY,
        "any.required": message.VALID_LAST_NAME_REQUIRED,
        "string.base": message.VALID_LAST_NAME_REQUIRED,
      }),

      email: Joi.string()
        .optional()
        .when(Joi.ref("$email"), {
          is: Joi.exist(),
          then: Joi.required().messages({
            "string.empty": message.EMAIL_NOT_EMPTY,
            "any.required": message.VALID_EMAIL_REQUIRED,
            "string.base": message.VALID_EMAIL_REQUIRED,
          }),
        })
        .messages({
          "string.empty": message.EMAIL_NOT_EMPTY,
          "any.required": message.VALID_EMAIL_REQUIRED,
          "string.base": message.VALID_EMAIL_REQUIRED,
        }),

      password: Joi.string()
        .optional()
        .when(Joi.ref("$password"), {
          is: Joi.exist(),
          then: Joi.required().messages({
            "string.empty": message.PASSWORD_NOT_EMPTY,
            "any.required": message.VALID_PASSWORD_REQUIRED,
            "string.base": message.VALID_PASSWORD_REQUIRED,
          }),
        })
        .messages({
          "string.empty": message.PASSWORD_NOT_EMPTY,
          "any.required": message.VALID_PASSWORD_REQUIRED,
          "string.base": message.VALID_PASSWORD_REQUIRED,
        }),

      status: Joi.boolean()
        .optional()
        .when(Joi.ref("$status"), {
          is: Joi.exist(),
          then: Joi.required().messages({
            "boolean.base": message.VALID_STATUS_REQUIRED,
          }),
        })
        .messages({
          "boolean.base": message.VALID_STATUS_REQUIRED,
        }),
    }).options({ abortEarly: false });

    const requestField = req?.body;

    const { error, value } = schema.validate(requestField);

    if (error) {
      const errorMessages = error.details.map((err) => ({
        field: err?.context?.key,
        message: err.message,
      }));

      return await commonResponse(
        req,
        res,
        commonResponseType.HTTP_RESPONSE.HTTP_BAD_REQUEST,
        commonResponseType.RESPONSE_SUCCESS.FALSE,
        errorMessages
      );
    }
    next();
  } catch (error) {
    console.log("Getting error while check create, update user:", error);

    return commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
