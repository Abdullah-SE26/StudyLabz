import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignOutButton from "../../components/SignOutButton";
import { toast } from "react-hot-toast";

// Read from .env, split by comma in case of multiple domains
const allowedDomains = (import.meta.env.VITE_ALLOWED_DOMAINS || "").split(",");

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const res = await fetch("http://localhost:5000/api/auth/send-magic-link", {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Login
        </h1>

        {authToken ? (
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-200 mb-4">You are logged in.</p>
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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
