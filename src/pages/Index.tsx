import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Auth from './Auth'

const Index = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    
    if (type === 'recovery') {
      // Redirect user to password reset screen
      navigate(`/reset-password${window.location.search}`)
      return
    }

    // If user is already logged in, redirect to home
    if (!loading && user) {
      navigate('/home')
    }
  }, [user, loading, navigate])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Authentication timeout reached, showing auth form')
        setTimeoutReached(true)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <Auth />
}

export default Index;
