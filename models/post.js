const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    designation: { type: String, required: true },
    responsibility: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    assignedTo: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
