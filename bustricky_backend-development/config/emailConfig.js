const nodemailer = require("nodemailer");

const emailConfig = {
  gmail: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  },

  mailtrap: {
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  },
};

const createTransporter = () => {
  const provider = process.env.EMAIL_PROVIDER || "mailtrap";
  const config = emailConfig[provider];

  console.log("Creating transporter for provider:", provider);
  console.log("Config found:", !!config);
  console.log("Auth user:", config?.auth?.user);
  console.log("Auth pass exists:", !!config?.auth?.pass);

  if (!config) {
    throw new Error(`Email provider '${provider}' is not configured`);
  }

  if (!config.auth.user || !config.auth.pass) {
    throw new Error(`Missing email credentials for provider '${provider}'`);
  }

  return nodemailer.createTransporter(config);
};

module.exports = {
  emailConfig,
  createTransporter,
};
