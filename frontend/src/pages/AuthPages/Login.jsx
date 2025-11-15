"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useStore } from "../../store/authStore";
import axios from "../../../lib/axios";
import SignOutButton from "../../components/SignOutButton";

const allowedDomains = (import.meta.env.VITE_ALLOWED_DOMAINS || "").split(",");

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authToken = useStore((state) => state.authToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast("Please enter your email.", { icon: "❗" });

    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      return toast.error("Invalid email domain. Only AAU emails are allowed.");
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/auth/send-magic-link", { email });
      toast.success(data.message || "Magic link sent! Check your email.");
      navigate("/verify-email", { state: { userEmail: email } });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background Image with rounded bottom */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover rounded-b-[6rem]"
        style={{ backgroundImage: "url('/LoginImage.png')" }}
      ></div>

      {/* Overlay + Login Form */}
      <div className="relative w-full max-w-sm p-6 flex flex-col items-center bg-white/30 backdrop-blur-md rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)]">

        {/* Owl Logo inside the form */}
        <img
          src="https://res.cloudinary.com/dhqyjs4tk/image/upload/v1763239292/StudyLabzOwl-nobg_gtoc7x.png"
          alt="StudyLabz Owl"
          className="w-16 h-16 object-contain mb-3"
        />

        <h1 className="text-xl font-bold text-sf-text mb-4 text-center">
          Login
        </h1>

        {!authToken ? (
          <form onSubmit={handleSubmit} className="space-y-3 w-full" autoComplete="on">
            <div className="form-control w-full">
              <input
                type="email"
                placeholder="Enter Your University Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input input-bordered w-full text-sf-text py-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-full flex items-center justify-center gap-2 bg-sf-green hover:bg-sf-green-hover text-white py-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending...
                </div>
              ) : (
                "Send Login Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sf-text/80 mb-2">You are logged in.</p>
            <SignOutButton />
          </div>
        )}
      </div>
    </div>
  );
}
