import nodemailer from "nodemailer";

export async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"OptiBuy" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.log("EMAIL ERROR:", error);
    throw error;
  }
}