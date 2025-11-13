import { sendMail } from "../config/mailer.js";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Setup DOMPurify for Node
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export const sendContactForm = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, message, subject } = req.body;

    // Required fields validation
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const contactSubject = subject?.trim() || "General Inquiry/Feedback";

    // Sanitize the message using DOMPurify
    const safeMessage = DOMPurify.sanitize(message, { ALLOWED_TAGS: ["b", "i", "strong", "em", "br", "p"] });

    // Compose email HTML
    const emailHTML = `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${fullName}</p>
      <p><b>Phone:</b> ${phone || "Not provided"}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Subject:</b> ${contactSubject}</p>
      <p><b>Message:</b><br/>${safeMessage}</p>
    `;

    // Send email
    await sendMail({
      from: `"StudyLabz Contact" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM,
      replyTo: email,
      subject: `📩 ${contactSubject} - Message from ${fullName}`,
      html: emailHTML,
    });

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};
