import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useStore } from "../../store/authStore";

export default function MagicLinkVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);
  const [status, setStatus] = useState("Verifying your magic link...");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

useEffect(() => {
  const verifyLink = async () => {
    if (!token || !email) {
      toast.error("Invalid magic link.");
      navigate("/");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_URL}/api/auth/verify-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const data = await res.json();

      if (res.ok && data.authToken && data.user) {
        // Store full user object including role
        setAuth(data.authToken, data.user);

        toast.success("Logged in successfully!");
        setStatus("Success! Redirecting...");

        // Redirect to dashboard after short delay
        setTimeout(() => navigate("/dashboard"), 1000);
      } else if (res.status === 401) {
        toast.error(data.error || "Invalid or expired link.");
        setStatus("This link is invalid or expired.");
      } else {
        toast.error(data.error || "Failed to log in.");
        setStatus("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
      setStatus("Network or server error. Try again.");
    }
  };

  verifyLink();
}, [token, email, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 text-center">
        <h1 className="text-xl font-semibold mb-4">{status}</h1>
        <p className="text-gray-600">
          {status.includes("Verifying") && "Please wait while we log you in."}
        </p>
      </div>
    </div>
  );
}
