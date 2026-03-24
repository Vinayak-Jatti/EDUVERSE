import nodemailer from "nodemailer";
import config from "../config/env.js";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: parseInt(config.mail.port),
  secure: config.mail.port == "465",
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

/**
 * Send OTP Verification Email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit code
 */
export const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: config.mail.from,
    to,
    subject: "Verify Your EDUVERSE Account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">EDUVERSE</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Welcome to the next generation of campus life. Use the code below to verify your account and start your journey.</p>
        <div style="margin: 40px 0; padding: 24px; background: #000; border-radius: 16px; text-align: center;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 12px; color: #fff; margin-left: 12px;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">This code expires in 10 minutes.</p>
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #ccc; font-size: 10px;">&copy; 2026 EDUVERSE. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✉️  Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Error sending email: ${error.message}`);
    throw error;
  }
};

/**
 * Send Password Reset Verification Email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit code
 */
export const sendPasswordResetEmail = async (to, otp) => {
  const mailOptions = {
    from: config.mail.from,
    to,
    subject: "Reset Your EDUVERSE Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">EDUVERSE</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Use the code below to securely change it.</p>
        <div style="margin: 40px 0; padding: 24px; background: #000; border-radius: 16px; text-align: center;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 12px; color: #fff; margin-left: 12px;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">This code expires in 10 minutes. If you did not request this, please ignore it.</p>
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #ccc; font-size: 10px;">&copy; 2026 EDUVERSE. All rights reserved.</p>
      </div>    
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✉️  Password reset email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Error sending password reset email: ${error.message}`);
    throw error;
  }
};
