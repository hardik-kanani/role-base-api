const userModel = require("./user");
const noteModel = require("./note");
const postModel = require("./post");

const _manager = {
  userModel: userModel,
  noteModel: noteModel,
  postModel: postModel,
};

module.exports = _manager;
