import { AppProvider, useApp } from './context';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MembersPage from './pages/MembersPage';
import InformationPage from './pages/InformationPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';

function AppRoutes() {
  const { currentUser, page } = useApp();

  if (!currentUser) return <LoginPage />;

  const isAdmin = currentUser.role !== 'Member';

  return (
    <Layout>
      {page === 'dashboard' && <DashboardPage />}
      {page === 'profile' && <ProfilePage />}
      {page === 'members' && <MembersPage />}
      {page === 'information' && <InformationPage />}
      {page === 'reports' && <ReportsPage />}
      {page === 'admin' && isAdmin && <AdminPage />}
      {page === 'admin' && !isAdmin && <DashboardPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
