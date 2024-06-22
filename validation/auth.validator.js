const Joi = require("joi");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");

//**************** LOGIN

exports.signInValidation = async (req, res, next) => {
  try {
    const message = commonResponseType?.VALIDATION_API_TOAST;

    const schema = Joi.object({
      email: Joi.string().required().messages({
        "string.empty": message.EMAIL_NOT_EMPTY,
        "string.base": message.VALID_EMAIL_REQUIRED,
        "any.required": message.VALID_EMAIL_REQUIRED,
      }),

      password: Joi.string().required().messages({
        "string.empty": message.PASSWORD_NOT_EMPTY,
        "string.base": message.VALID_PASSWORD_REQUIRED,
        "any.required": message.VALID_PASSWORD_REQUIRED,
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
    console.log("Getting error while check sign in validation:", error);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
