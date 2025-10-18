import { useEffect, useState } from "react";
import { useStore } from "../../store/authStore";

export default function AuthProvider({ children }) {
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);
  const setAuth = useStore((state) => state.setAuth);
  const clearAuth = useStore((state) => state.clearAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      // If no token or user already exists → skip verification
      if (!authToken || user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-token", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await res.json();

        if (res.ok && data.user) {
          setAuth(authToken, data.user);
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [authToken, user, setAuth, clearAuth]); // ✅ watch user to prevent repeated setAuth

  if (loading) return null; // prevent rendering before verification
  return children;
}
