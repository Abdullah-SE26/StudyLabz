import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendMail = async ({ from, to, subject, html }) => {
  try {
    await sgMail.send({ from, to, subject, html });
    console.log("✅ Email sent successfully via SendGrid API");
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};
