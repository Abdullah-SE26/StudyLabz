import { sendMail } from "../config/mailer.js";

export const sendContactForm = async (req, res) => {
  console.log("Form data received:", req.body);

  try {
    const { firstName, lastName, phone, email, message, subject } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const fullName = `${firstName} ${lastName}`;

    // Compose email HTML
    const emailHTML = `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${fullName}</p>
      <p><b>Phone:</b> ${phone || "Not provided"}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Subject:</b> ${subject || "General Inquiry"}</p>
      <p><b>Message:</b><br/>${message}</p>
    `;

    // Send email via SendGrid
    await sendMail({
      from: `"StudyLabz Contact" <${process.env.EMAIL_FROM}>`, // ✅ Verified sender
      to: process.env.EMAIL_FROM, // You receive the contact form in your inbox
      subject: `📩 ${subject || "General Inquiry"} - Message from ${fullName}`,
      html: emailHTML,
    });

    console.log("✅ Email sent successfully");
    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};
