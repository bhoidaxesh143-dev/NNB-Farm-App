import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="text-center">
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
          404
        </h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

