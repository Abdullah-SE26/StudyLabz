import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// -----------------------------
// Helper: send email
// -----------------------------
const sendEmail = async (to, magicLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="/frontend/public/scientist_owl_512.png" alt="StudyLabz Logo" style="width: 120px; height: auto;" />
      </div>
      <h2 style="text-align: center; color: #333;">Hello!</h2>
      <p style="font-size: 16px; color: #555; line-height: 1.5;">
        You requested a login link for <strong>StudyLabz</strong>. Click the button below to sign in. 
        This link will expire in 15 minutes.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${magicLink}" style="
          background-color: #4a90e2;
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 5px;
          font-weight: bold;
          display: inline-block;
        ">Sign In to StudyLabz</a>
      </div>
      <p style="font-size: 14px; color: #999; text-align: center;">
        If you did not request this email, you can safely ignore it.<br/>
        &copy; ${new Date().getFullYear()} StudyLabz. All rights reserved.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Login Link for StudyLabz",
    html: emailHTML,
  });
};


// Send Magic Link (with rate limit)
export const sendMagicLink = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    // Rate limiting: 2 minutes
    const now = Date.now();
    const cooldown = 2 * 60 * 1000;
    if (user.lastMagicLinkSent && now - user.lastMagicLinkSent < cooldown) {
      const wait = Math.ceil((cooldown - (now - user.lastMagicLinkSent)) / 1000);
      return res.status(429).json({
        error: `Please wait ${wait}s before requesting a new magic link.`,
      });
    }

    // Generate token
    const token = Math.random().toString(36).slice(2, 12);
    user.magicToken = await bcrypt.hash(token, 10);
    user.magicTokenExpiry = now + 15 * 60 * 1000; // 15 mins
    user.lastMagicLinkSent = now;
    await user.save();

    const magicLink = `${process.env.BACKEND_URL}/api/auth/verify-magic-link?token=${token}&email=${email}`;

    await sendEmail(email, magicLink);

    res.json({ message: "Magic link sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// GET Verify Magic Link → Redirect
export const handleMagicLink = async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) {
    return res.status(400).send("Invalid request");
  }

  // Always redirect to frontend for final verification
  const redirectUrl = `${process.env.FRONTEND_URL}/magic-verify?token=${token}&email=${email}`;
  res.redirect(redirectUrl);
};


// POST Verify Magic Link → Issue JWT
export const verifyMagicLink = async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ error: "Missing token or email" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired link" });
    }

    // Use model helper to check token & expiry
    const isValid = await user.verifyMagicToken(token);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid or expired link" });
    }

    // Clear token and expiry after successful verification
    user.magicToken = undefined;
    user.magicTokenExpiry = undefined;
    await user.save();

    // Generate JWT
    const authToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        studentId: user.studentId || null,
        name: user.name || null,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ authToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
