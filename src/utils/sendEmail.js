import axios from "axios";

export async function sendEmail(to, subject, html) {
  const res = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "OptiBuy",
        email: process.env.SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
    }
  );

  return res.data;
}
``
