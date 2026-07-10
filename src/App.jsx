import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import AdminLayout from './components/admin/AdminLayout';
import TalentosPage from './pages/admin/TalentosPage';
import VagasPage from './pages/admin/VagasPage';
import MensagensPage from './pages/admin/MensagensPage';
import TemplatesPage from './pages/admin/TemplatesPage';
// Add page imports here
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Rotas de autenticação acessíveis sem login
const AUTH_PATHS = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha'];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authError?.type === 'auth_required' && !AUTH_PATHS.includes(location.pathname)) {
      navigate('/login', { state: { returnTo: location.pathname + location.search }, replace: true });
    }
  }, [authError, location.pathname, location.search, navigate]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to internal /login page (useEffect handles navigation)
      if (!AUTH_PATHS.includes(location.pathname)) return null;
      // Em rota de auth — segue para renderizar as rotas
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<TalentosPage />} />
        <Route path="talentos" element={<TalentosPage />} />
        <Route path="vagas" element={<VagasPage />} />
        <Route path="mensagens" element={<MensagensPage />} />
        <Route path="templates" element={<TemplatesPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App