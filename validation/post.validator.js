const Joi = require("joi");
const commonResponseType = require("../static.json");
const { commonResponse } = require("../services/common.service");

//**************** LOGIN

exports.postValidation = async (req, res, next) => {
  try {
    const message = commonResponseType?.VALIDATION_API_TOAST;

    const schema = Joi.object({
      title: Joi.string().required().messages({
        "string.empty": message.TITLE_NOT_EMPTY,
        "string.base": message.VALID_TITLE_REQUIRED,
        "any.required": message.VALID_TITLE_REQUIRED,
      }),

      designation: Joi.string().required().messages({
        "string.empty": message.DESIGNATION_NOT_EMPTY,
        "string.base": message.VALID_DESIGNATION_REQUIRED,
        "any.required": message.VALID_DESIGNATION_REQUIRED,
      }),

      description: Joi.string().required().messages({
        "string.empty": message.DESCRIPTION_NOT_EMPTY,
        "string.base": message.VALID_DESCRIPTION_REQUIRED,
        "any.required": message.VALID_DESCRIPTION_REQUIRED,
      }),

      location: Joi.string().required().messages({
        "string.empty": message.LOCATION_NOT_EMPTY,
        "string.base": message.VALID_LOCATION_REQUIRED,
        "any.required": message.VALID_LOCATION_REQUIRED,
      }),

      responsibility: Joi.string().required().messages({
        "string.empty": message.RESPONSIBILITY_NOT_EMPTY,
        "string.base": message.VALID_RESPONSIBILITY_REQUIRED,
        "any.required": message.VALID_RESPONSIBILITY_REQUIRED,
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
    console.log("Getting error while check post validation:", error);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
};
