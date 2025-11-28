import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0'
    }}>
      <div className="container flex justify-between items-center">
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--primary-color)' }}>
          MERN App
        </Link>

        <div className="flex items-center" style={{ gap: '1rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>Home</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>Dashboard</Link>
              <Link to="/profile" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>Profile</Link>
              <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

