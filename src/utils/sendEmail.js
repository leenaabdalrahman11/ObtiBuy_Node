import nodemailer from "nodemailer";

export async function sendEmail(to, subject, html) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASS, 
          },
    });

    const info = await transporter.sendMail({
        from: `"OptiBuy" <${process.env.SENDER_EMAIL}>`,
        to,
        subject,
        html,
    });

    console.log("Email sent:", info.messageId);
}
