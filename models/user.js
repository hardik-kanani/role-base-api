const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    is_verified: { type: Boolean, default: false },
    password: { type: String, required: true },
    status: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["admin", "recruiter", "client"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
