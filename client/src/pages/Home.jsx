import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="text-center">
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Welcome to MERN App
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Industrial-grade MERN stack application with best practices
        </p>

        {!isAuthenticated && (
          <div className="flex justify-center" style={{ gap: '1rem' }}>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        )}

        <div className="mt-4" style={{ marginTop: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Secure
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                JWT authentication, rate limiting, and OWASP best practices
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Scalable
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Stateless architecture, Redis caching, and horizontal scaling
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Observable
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Structured logging, health checks, and performance metrics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

