import { AuthProvider } from '../lib/auth'
import { ThemeProvider } from '../lib/theme'
import Navbar from '../components/Navbar'
import AuthCheck from '../components/AuthCheck'
import '../styles/global.css'
import { useEffect } from 'react'
import { NotificationProvider } from '../lib/notifications'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // MSX-style cursor
    document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="none"/><path fill="%2338b6ff" d="M8 1L1 15h4l-1 1h8l-1-1h4L8 1z"/></svg>'), auto`
  }, [])

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Navbar />
          <Component {...pageProps} />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}