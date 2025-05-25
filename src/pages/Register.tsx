
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate("/");
    } else {
      // Redirect to the new register choice page
      navigate("/register-choice");
    }
  }, [user, navigate]);

  return null;
};

export default Register;
