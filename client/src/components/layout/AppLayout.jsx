import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="cyber-grid flex min-h-screen flex-col bg-surface">
      <Nav />
      <main className="flex-1 pt-88px">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}