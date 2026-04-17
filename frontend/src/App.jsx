import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Pages
const Login = lazy(() => import('@/features/auth/Login'));
const VerifyEmail = lazy(() => import('@/features/auth/VerifyEmail'));
const SetPassword = lazy(() => import('@/features/auth/SetPassword'));
const VerifyTempPassword = lazy(() => import('@/features/auth/VerifyTempPassword'));
const SelfRegister = lazy(() => import('@/features/auth/SelfRegister'));
const CompleteProfile = lazy(() => import('@/features/profile/CompleteProfile'));
const ProfileModern = lazy(() => import('@/features/profile/ProfileModern'));
const MyConnections = lazy(() => import('@/features/profile/MyConnections'));
const MyActivity = lazy(() => import('@/features/profile/MyActivity'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
const Startup = lazy(() => import('@/features/startup/Startup'));
const StartupDetails = lazy(() => import('@/features/startup/StartupDetails'));
const SignUp = lazy(() => import('@/features/auth/SignUp'));
const Directory = lazy(() => import('@/features/directory/DirectoryPolished'));
const HomeCommunity = lazy(() => import('@/features/home/HomeCommunity'));
const FeedClean = lazy(() => import('@/features/feed/FeedClean'));
const Opportunities = lazy(() => import('@/features/opportunities/Opportunities'));
const OpportunityDetails = lazy(() => import('@/features/opportunities/OpportunityDetails'));
const ChallengesList = lazy(() => import('@/features/challenges/ChallengesList'));
const PostChallenge = lazy(() => import('@/features/challenges/PostChallenge'));
const ChallengeDetails = lazy(() => import('@/features/challenges/ChallengeDetails'));
const Events = lazy(() => import('@/features/events/Events'));
const ChatRoom = lazy(() => import('@/features/chat/ChatRoom'));
const SearchPage = lazy(() => import('@/features/search/SearchPage'));

// Protected Route Wrapper
function ProtectedRoute({ children, isFirstLogin = false }) {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If user needs to set password but is trying to go somewhere else
  if (auth.alumni?.isFirstLogin && !isFirstLogin) {
    return <Navigate to="/set-password" replace />;
  }

  return children;
}

export default function App() {
  const auth = useAuth();

  const routeFallback = (
    <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={routeFallback}>
          <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/self-register" element={<SelfRegister />} />
                <Route path="/verify-temp-password" element={<VerifyTempPassword />} />
                <Route path="/set-password" element={<SetPassword />} />
                <Route path="/" element={<><HomeCommunity /><Footer /></>} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/feed" element={<FeedClean />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/opportunities/:id" element={<OpportunityDetails />} />
                <Route path="/challenges" element={<ChallengesList />} />
                <Route path="/challenges/:id" element={<ChallengeDetails />} />
                <Route
                  path="/challenges/post"
                  element={
                    <ProtectedRoute>
                      <PostChallenge />
                    </ProtectedRoute>
                  }
                />
                <Route path="/events" element={<Events />} />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <SearchPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/complete-profile"
                  element={
                    <ProtectedRoute>
                      <CompleteProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile/me"
                  element={
                    <ProtectedRoute>
                      <ProfileModern />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile/:id"
                  element={
                    <ProtectedRoute>
                      <ProfileModern />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-connections"
                  element={
                    <ProtectedRoute>
                      <MyConnections />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-activity"
                  element={
                    <ProtectedRoute>
                      <MyActivity />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/chat/:id"
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/innovation"
                  element={
                    <ProtectedRoute>
                      <Startup />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/innovation/:id"
                  element={
                    <ProtectedRoute>
                      <StartupDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
  );
}
