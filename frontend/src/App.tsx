import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import SettingsLayout from './layouts/SettingsLayout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GeneralSettingsPage from './pages/GeneralSettingsPage';
import AppearanceSettingsPage from './pages/AppearanceSettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallback from './pages/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';

// Money Features
import MoneyLayout from './features/money/MoneyLayout';
import MoneyDashboard from './features/money/MoneyDashboard';
import TransactionsPage from './features/money/TransactionsPage';
import PeoplePage from './features/money/PeoplePage';
import PersonDetailsPage from './features/money/PersonDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Route>

        <Route 
          path="/app/settings" 
          element={
            <ProtectedRoute>
              <SettingsLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<ProfilePage />} />
          <Route path="general" element={<GeneralSettingsPage />} />
          <Route path="appearance" element={<AppearanceSettingsPage />} />
          <Route index element={<Navigate to="profile" replace />} />
        </Route>

        {/* Protected App Routes with Navbar */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Money Feature Routes */}
          <Route path="money" element={<MoneyLayout />}>
            <Route index element={<MoneyDashboard />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:personId" element={<PersonDetailsPage />} />
          </Route>
          
          {/* Future routes: */}
          {/* <Route path="tasks" element={<TasksPage />} /> */}
        </Route>

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
