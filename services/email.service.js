const nodemailer = require("nodemailer");

const sendEmail = async (userEmail, subject, contact) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SENDGRID_HOST,
      port: process.env.SENDGRID_PORT,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDGRID_SECRET_KEY,
      },
    });

    const response = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: userEmail,
      subject: subject,
      html: contact,
    });

    if (response) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log("Getting error while send email:", err);

    return false;
  }
};

module.exports = {
  sendEmail: sendEmail,
};
