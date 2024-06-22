const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/client.routes");
const recruiterRoutes = require("./routes/recruiter.routes");
const dotenv = require("dotenv");
const seeder = require("./seeder/seeder");
dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/admin", adminRoutes);

//================= DATABASE CONNECTION

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

//================= LISTEN

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `your server start at http://${process.env.HOST || "localhost"}:${PORT}`
  );
});
