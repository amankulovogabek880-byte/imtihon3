import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const createTransporter = () => {
  const user = process.env.GOOGLE_ACCOUNT_USER;
  const pass = process.env.GOOGLE_APP_PASSWORD;

  if (!user || !pass || pass === "your_google_app_password") return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
};

export const sendMail = async ({ to, subject, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    logger.info(`Email skipped. To: ${to}, Subject: ${subject}, Text: ${text}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.GOOGLE_ACCOUNT_USER,
    to,
    subject,
    text
  });
};
