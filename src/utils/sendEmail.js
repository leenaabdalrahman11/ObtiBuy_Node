import axios from "axios";

export async function sendEmail(to, subject, html) {
  try {
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

    console.log("BREVO RESPONSE:", res.data);
    return res.data;
  } catch (error) {
    console.log("BREVO ERROR STATUS:", error.response?.status);
    console.log("BREVO ERROR DATA:", error.response?.data);
    console.log("BREVO ERROR MESSAGE:", error.message);
    throw error;
  }
}