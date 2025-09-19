import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useStore } from "../../store/authStore";

export default function MagicLinkVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      navigate("/");
      return;
    }

    const verifyLink = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/auth/verify-magic-link",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, email }),
          }
        );

        const data = await res.json();

        if (res.ok && data.authToken) {
          const decoded = JSON.parse(atob(data.authToken.split(".")[1]));

          const user = {
            name: decoded.name || null,
            studentId: decoded.studentId || null,
          };

          setAuth(data.authToken, user); // ✅ update Zustand store
          toast.success("Logged in successfully!");
        } else {
          toast.error(data.error || "Failed to log in.");
        }

        navigate("/");
      } catch (err) {
        console.error(err);
        toast.error("An error occurred. Please try again.");
        navigate("/");
      }
    };

    verifyLink();
  }, [token, email, navigate, setAuth]);

  return <div>Logging you in...</div>;
}
