import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const email = query.get("email");

    if (email) {
      localStorage.setItem("user_email", email);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login" , { replace: true });
    }
  }, [location.search]); // ✅ Triggers effect when URL changes

  return (
    <div className="text-center mt-10">Logging you in...</div>
  );
}
