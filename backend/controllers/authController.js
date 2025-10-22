import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../config/mailer.js"; 

// -----------------------------
// Send Magic Link
// -----------------------------
export const sendMagicLink = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    // Create new user if it doesn't exist
    if (!user) {
      const studentId = email.includes("@") ? email.split("@")[0] : null;
      user = await prisma.user.create({
        data: { email, role: "user", studentId },
      });
      console.log("Created new user:", user);
    }

    // Rate limiting: 2 minutes
    const now = new Date();
    const cooldown = 2 * 60 * 1000;
    if (user.lastMagicLinkSent && now - new Date(user.lastMagicLinkSent) < cooldown) {
      const wait = Math.ceil((cooldown - (now - new Date(user.lastMagicLinkSent))) / 1000);
      return res.status(429).json({ error: `Please wait ${wait}s before requesting a new magic link.` });
    }

    // Generate token
    const token = Math.random().toString(36).slice(2, 12);
    const hashedToken = await bcrypt.hash(token, 10);

    // Update user with token
    await prisma.user.update({
      where: { email: user.email },
      data: {
        magicToken: hashedToken,
        magicTokenExpiry: new Date(now.getTime() + 15 * 60 * 1000),
        lastMagicLinkSent: now,
      },
    });

    // Compose magic link email
    const magicLink = `${process.env.BACKEND_URL}/api/auth/verify-magic-link?token=${token}&email=${email}`;
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${process.env.FRONTEND_URL}/scientist_owl_512.png" alt="StudyLabz Logo" style="width: 120px; height: auto;" />
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

    await sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login Link for StudyLabz",
      html: emailHTML,
    });

    return res.json({ message: "Magic link sent!" });
  } catch (err) {
    console.error("sendMagicLink error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Handle Magic Link Redirect
// -----------------------------
export const handleMagicLink = async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) return res.status(400).send("Invalid request");

  const redirectUrl = `${process.env.FRONTEND_URL}/magic-verify?token=${token}&email=${email}`;
  res.redirect(redirectUrl);
};

// -----------------------------
// Verify Magic Link and Issue JWT
// -----------------------------
export const verifyMagicLink = async (req, res) => {
  const { token, email } = req.body;
  if (!token || !email)
    return res.status(400).json({ error: "Missing token or email" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.magicToken || !user.magicTokenExpiry) {
      return res.status(401).json({ error: "Invalid or expired link" });
    }

    if (new Date(user.magicTokenExpiry) < new Date())
      return res.status(401).json({ error: "Link expired" });

    const isValid = await bcrypt.compare(token, user.magicToken);
    if (!isValid)
      return res.status(401).json({ error: "Invalid or expired link" });

    // Clear token after successful verification
    await prisma.user.update({
      where: { email },
      data: { magicToken: null, magicTokenExpiry: null },
    });

    const authToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        studentId: user.studentId || null,
        name: user.name || null,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      authToken,
      user: {
        id: user.id,
        email: user.email,
        studentId: user.studentId || null,
        name: user.name || null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("verifyMagicLink error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
