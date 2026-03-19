import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "465"),
  secure: process.env.MAIL_PORT == "465", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send OTP Verification Email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit code
 */
export const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
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
    console.log("✉️  Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
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
    from: process.env.MAIL_FROM,
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
    console.log("✉️  Password reset email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw error;
  }
};
