import { useLocation, Navigate } from "react-router-dom";
import { useStore } from "../store/authStore";

const ProtectedRoute = ({ children }) => {
  const authToken = useStore((state) => state.authToken);
  const location = useLocation();

  if (!authToken) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // log in, which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
