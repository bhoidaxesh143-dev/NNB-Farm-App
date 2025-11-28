import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-primary p-4 text-center" style={{ backgroundColor: 'var(--text-primary)', color: 'white' }}>
        <p>&copy; 2025 MERN App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;

