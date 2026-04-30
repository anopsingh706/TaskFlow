import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }   from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { TaskProvider }   from './context/TaskContext'
import ProtectedRoute     from './components/auth/ProtectedRoute'
import AppLayout          from './components/layout/AppLayout'

import HomePage          from './pages/HomePage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import DashboardPage     from './pages/DashboardPage'
import ChatPage          from './pages/ChatPage'
import TasksPage         from './pages/TasksPage'
import MeetingsPage      from './pages/MeetingsPage'
import ProfilePage       from './pages/ProfilePage'
import PricingPage       from './pages/PricingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentCancelPage from './pages/PaymentCancelPage'
import NotFoundPage      from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <TaskProvider>
            <Routes>
              <Route path="/"              element={<HomePage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard"       element={<DashboardPage />} />
                  <Route path="/chat"            element={<ChatPage />} />
                  <Route path="/chat/:channelId" element={<ChatPage />} />
                  <Route path="/tasks"           element={<TasksPage />} />
                  <Route path="/meetings"        element={<MeetingsPage />} />
                  <Route path="/profile"         element={<ProfilePage />} />
                  <Route path="/pricing"         element={<PricingPage />} />
                  <Route path="/payment/success" element={<PaymentSuccessPage />} />
                  <Route path="/payment/cancel"  element={<PaymentCancelPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </TaskProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
