// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/User.js"; // note .js for ESM

const router = express.Router();

// Send Magic Link
router.post("/send-magic-link", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const hashedToken = await bcrypt.hash(token, 10);
    user.magicToken = hashedToken;
    user.magicTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const magicLink = `${process.env.FRONTEND_URL}/magic-verify?token=${token}&email=${email}`;

    const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="LOGO_URL_HERE" alt="StudyLabz Logo" style="width: 120px; height: auto;" />
      </div>

      <!-- Greeting -->
      <h2 style="text-align: center; color: #333;">Hello!</h2>

      <!-- Message -->
      <p style="font-size: 16px; color: #555; line-height: 1.5;">
        You requested a magic login link for <strong>StudyLabz</strong>. Click the button below to sign in. 
        This link will expire in 15 minutes.
      </p>

      <!-- Button -->
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

      <!-- Footer -->
      <p style="font-size: 14px; color: #999; text-align: center;">
        If you did not request this email, you can safely ignore it.<br/>
        &copy; ${new Date().getFullYear()} StudyLabz. All rights reserved.
      </p>
    </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Magic Login Link for StudyLabz",
      html: emailHTML,
    });

    res.json({ message: "Magic link sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify Magic Link
router.post("/verify-magic-link", async (req, res) => {
  const { token, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.magicToken || !user.magicTokenExpiry) {
      return res.status(400).json({ error: "Invalid or expired link" });
    }

    if (Date.now() > user.magicTokenExpiry) {
      return res.status(400).json({ error: "Link expired" });
    }

    const isValid = await bcrypt.compare(token, user.magicToken);
    if (!isValid) return res.status(400).json({ error: "Invalid link" });

    user.magicToken = undefined;
    user.magicTokenExpiry = undefined;
    await user.save();

    const authToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ authToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ ESM default export
export default router;
