import nodemailer from "nodemailer";
export async function sendEmail(to,subject,html){
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.SENDER_EMAIL,
            pass:process.env.SENDER_PASS,
        },
    });
    const info = await transporter.sendMail({
        from:`"OptiBuy" <${process.env.SENDER_EMAIL}>`,
        to,
        subject,
        html,
    });
}




