// emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();


// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your email provider
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// Function to send email
const sendWelcomeEmail = (to, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to Netstar!',
    text: `Hello ${name},\n\nThank you for signing up with us! We hope you enjoy exploring and watching movies.\n\nBest regards,\nNetstar`,
    html: `<p>Hello ${name},</p><p>Thank you for signing up with us! We hope you enjoy exploring and watching movies.</p><p>Best regards,<br/>Netstar</p>`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };
