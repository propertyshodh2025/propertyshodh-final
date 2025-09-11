// Update the import
import { isAdminAuthenticated } from '@/lib/adminSupabase';

// Then use it in your component
const AdminRouteProtection = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAdminAuthenticated();
      setAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  if (!authenticated) return <Navigate to="/admin-login" />;
  return <Outlet />;
};