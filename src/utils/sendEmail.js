import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    servername: "smtp.gmail.com",
  },
});

export async function sendEmail(to, subject, html) {
  try {
    const sendPromise = transporter.sendMail({
      from: `"OptiBuy" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("EMAIL_TIMEOUT")), 15000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.log("Email failed:", err?.message || err);
    return false;
  }
}



/*import nodemailer from "nodemailer";

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
*/