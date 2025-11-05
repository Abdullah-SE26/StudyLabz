import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useStore } from "../../store/authStore";
import axios from "../../../lib/axios.js";

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
        navigate("/", { replace: true });
        return;
      }

      try {
        const { data } = await axios.post("/auth/verify-magic-link", { token, email });

        if (data?.authToken && data?.user) {
          setAuth(data.authToken, data.user);
          toast.success("Logged in successfully!");
          setStatus("Success! Redirecting...");
          setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
        } else {
          toast.error(data?.error || "Failed to log in.");
          setStatus("Something went wrong. Please try again.");
        }
      } catch (err) {
        console.error("Magic link verification failed:", err);

        // Handle token expiration via axios interceptor
        if (err.isAuthExpired) {
          setStatus("Session expired. Redirecting to login...");
          setTimeout(() => navigate("/login", { replace: true }), 1000);
          return;
        }

        toast.error(err?.response?.data?.error || "An unexpected error occurred.");
        setStatus("This link is invalid or expired.");
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
