const db = require("../models/db-manager");
const { commonResponse } = require("../services/common.service");
const commonResponseType = require("../static.json");

//======== SUPER ADMIN SEEDER
async function superAdminSeeder() {
  try {
    const users = await db.userModel.countDocuments();

    if (users === 0) {
      await db.userModel.create({
        first_name: "Super",
        last_name: "Admin",
        email: "super.admin@gmail.com",
        role: "admin",
        status: true,
        password:
          "$2a$12$R5UvAD5pvWvxEd46v3FDqeLhdy3No2Xi9PGQ4If8MQxdq0LJeQ.JG", // Test@123
        is_verified: true,
      });
    }
  } catch (error) {
    console.log("Getting error while feed admin seeder:", error);

    return await commonResponse(
      req,
      res,
      commonResponseType.HTTP_RESPONSE.HTTP_INTERNAL_SERVER_ERROR,
      commonResponseType.RESPONSE_SUCCESS.FALSE,
      commonResponseType.ERROR_API_TOAST.COMMON_ERR_MSG
    );
  }
}
superAdminSeeder();
