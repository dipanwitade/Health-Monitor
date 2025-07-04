import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user_email");
    navigate('/login');
  }, [navigate]);

  return null; // Blank screen briefly
};

export default Logout;
