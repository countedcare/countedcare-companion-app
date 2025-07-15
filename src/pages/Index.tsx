import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Auth from './Auth'

const Index = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    
    if (type === 'recovery') {
      // Redirect user to password reset screen
      navigate(`/reset-password${window.location.search}`)
      return
    }

    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <Auth />
}

export default Index;
