import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardHome from './pages/DashboardHome';
import AddEndpoint from './pages/AddEndpoint';
import EndpointDetail from './pages/EndpointDetail';
import DiffDetailView from './pages/DiffDetailView';
import NotificationSettings from './pages/NotificationSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Landing />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/dashboard/add" element={<AddEndpoint />} />
                  <Route path="/dashboard/endpoints/:id" element={<EndpointDetail />} />
                  <Route path="/dashboard/endpoints/:id/diff/:checkId" element={<DiffDetailView />} />
                  <Route path="/dashboard/settings" element={<NotificationSettings />} />
                </Route>
              </Route>

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}