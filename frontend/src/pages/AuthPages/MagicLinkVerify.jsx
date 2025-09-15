import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function MagicLinkVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      navigate("/"); // No token/email, redirect to home
      return;
    }

    const verifyLink = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/verify-magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();

        if (res.ok && data.authToken) {
          // Save JWT and navigate
          localStorage.setItem("authToken", data.authToken);
          toast.success("Logged in successfully!");
        } else {
          // Only show alert if no valid JWT exists yet
          if (!localStorage.getItem("authToken")) {
            toast.error(data.error || "Failed to log in.");
          }
        }

        // Redirect to home in all cases
        navigate("/");
      } catch (err) {
        console.error("Verification error:", err);
        if (!localStorage.getItem("authToken")) {
          toast.error("An error occurred. Please try again.");
        }
        navigate("/");
      }
    };

    verifyLink();
  }, [token, email, navigate]);

  return <div>Logging you in...</div>;
}
