import nodemailer from "nodemailer";

export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"OptiBuy" <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    html,
  });

  return info;
}
