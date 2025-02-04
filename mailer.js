// mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from .env
const fs = require("fs");
const path = require("path");

// Create a function to send emails
const sendEmail = async (recipientEmail, subject, name, token) => {
  // Step 1: Configure nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: "gmail", // You can use any email service provider
    auth: {
      user: process.env.EMAIL_USER, // Your email address from .env
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });
  const templatePath = path.join(__dirname, "template.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const recipientName = name; // Replace with recipient's actual name
  htmlTemplate = htmlTemplate.replace("{{name}}", recipientName);
  htmlTemplate = htmlTemplate.replace("{{token}}", token);
  // Step 2: Define the email options
  let mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email address
    to: recipientEmail, // Recipient's email address
    subject: subject, // Subject of the email
    html: htmlTemplate, // Plain text body of the email
  };

  // Step 3: Send the email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

module.exports = sendEmail;
