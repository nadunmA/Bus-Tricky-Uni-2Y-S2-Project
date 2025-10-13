const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransporter({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
    await transporter.verify();

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@bustracker.com",
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, "<br>"),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;
