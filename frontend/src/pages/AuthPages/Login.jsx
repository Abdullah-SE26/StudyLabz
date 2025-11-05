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
    <div className="min-h-screen flex items-center justify-center px-4 bg-base-200">
      <div className="card w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Login
        </h1>

        {!authToken ? (
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="form-control w-full">
              <input
                type="email"
                placeholder="Enter Your University Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input input-bordered w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
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
          <div className="text-center space-y-4">
            <p className="text-gray-700 mb-4">You are logged in.</p>
            <SignOutButton />
          </div>
        )}
      </div>
    </div>
  );
}
