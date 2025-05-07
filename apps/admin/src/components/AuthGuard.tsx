import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tryAutoAuthenticate } from '../request/auth';
import { useUserStore } from '../store/user';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const setUserInfo = useUserStore(state => state.setUserInfo);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await tryAutoAuthenticate();
      if (result.success) {
        navigate('/dashboard');
      } else {
        navigate('/auth/login');
      }
    };

    checkAuth();
  }, [navigate, setUserInfo]);

  return <>{children}</>;
}; 