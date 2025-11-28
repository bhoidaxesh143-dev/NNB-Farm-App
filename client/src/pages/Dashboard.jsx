import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Dashboard
      </h1>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Welcome, {user?.name}!
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          This is your dashboard. You&apos;re successfully authenticated!
        </p>

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            Your Information
          </h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Role:</strong> {user?.role}
            </div>
            <div>
              <strong>Account Created:</strong>{' '}
              {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

