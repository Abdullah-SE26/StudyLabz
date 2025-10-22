import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignOutButton from "../../components/sign-out-button";
import { toast } from "react-hot-toast";

// Read from .env, split by comma in case of multiple domains
const allowedDomains = (import.meta.env.VITE_ALLOWED_DOMAINS || "").split(",");

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL; // ✅ use env

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast("Please enter your email.", { icon: "❗" });
    }

    // Validate email domain
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      return toast.error("Invalid email domain. Only AAU emails are allowed.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/verify-email", { state: { userEmail: email } });
      } else {
        toast.error(data.error || "Failed to send magic link.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const authToken = localStorage.getItem("authToken");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Login
        </h1>

        {authToken ? (
          <div className="text-center">
            <p className="text-gray-700  mb-4">You are logged in.</p>
            <SignOutButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <input
              type="email"
              placeholder="Enter Your University Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 "
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 cursor-pointer bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 animate-[spin_0.8s_linear_infinite] fill-white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" />
                  </svg>
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Magic Link"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
