import { Route, Routes } from 'react-router-dom';
import { ChatRedirect } from './components/ChatRedirect';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AboutPage } from './pages/AboutPage';
import { ChemistryDetailPage } from './pages/ChemistryDetailPage';
import { ChemistryPage } from './pages/ChemistryPage';
import FavoritesPage from './pages/FavoritesPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { TrainingPage } from './pages/TrainingPage';
import { TrainingPackPage } from './pages/TrainingPackPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="chemistry"
          element={
            <ProtectedRoute>
              <ChemistryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="chemistry/:slug"
          element={
            <ProtectedRoute>
              <ChemistryDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="training"
          element={
            <ProtectedRoute>
              <TrainingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="training/:packId"
          element={
            <ProtectedRoute>
              <TrainingPackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai"
          element={
            <ProtectedRoute>
              <ChatRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
