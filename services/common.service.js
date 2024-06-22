const commonResponse = (
  req,
  res,
  statusCode,
  success,
  message,
  data,
  token
) => {
  const response = {
    success: success,
    message: message,
    data: data,
    token: token,
  };
  if ([null, undefined].includes(response.data)) delete response.data;
  if ([null, undefined].includes(response.token)) delete response.token;

  return res.status(statusCode).json(response);
};

module.exports = {
  commonResponse: commonResponse,
};
