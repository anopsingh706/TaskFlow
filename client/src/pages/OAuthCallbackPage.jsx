/**
 * OAuthCallbackPage — /auth/callback
 *
 * After Google redirects the browser here, this page:
 *  1. Reads the JWT from the URL hash (#token=xxx)
 *  2. Stores it in localStorage under the same key the AuthContext uses
 *  3. Fetches /api/auth/me to get the user object
 *  4. Stores the user in localStorage
 *  5. Navigates to /dashboard
 *
 * Why hash instead of query string?
 * Hash fragments are NEVER sent to the server — they only exist in the
 * browser. This means the token won't appear in server logs or in the
 * Referrer header when the page loads third-party resources.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import LoadingScreen from '../components/ui/LoadingScreen'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the hash: "#token=eyJ..."
        const hash  = window.location.hash.slice(1)           // remove '#'
        const params = new URLSearchParams(hash)
        const token  = params.get('token')

        if (!token) {
          setError('No token received from Google. Please try again.')
          return
        }

        // Persist the token exactly as AuthContext expects
        localStorage.setItem('taskflow_token', token)

        // Fetch the user profile to populate localStorage
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        localStorage.setItem('taskflow_user', JSON.stringify(data.user))

        // Clear the hash from the URL for security, then navigate
        window.history.replaceState(null, '', window.location.pathname)
        navigate('/dashboard', { replace: true })

        // Force a full reload so AuthContext re-reads localStorage
        window.location.reload()
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError('Authentication failed. Please try again.')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="font-display text-2xl font-semibold text-gray-900 mb-2">Sign-in failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a href="/login" className="btn-primary">Back to login</a>
        </div>
      </div>
    )
  }

  return <LoadingScreen />
}
