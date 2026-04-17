import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { RealTimeProvider } from '@/contexts/RealTimeContext'
import LinkedInNotificationsProvider from '@/components/LinkedInNotifications'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <AuthProvider>
      <LinkedInNotificationsProvider>
        <RealTimeProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </RealTimeProvider>
      </LinkedInNotificationsProvider>
    </AuthProvider>
  </Router>,
)
