import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Auth from './Auth'

const Index = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    
    if (type === 'recovery') {
      // Redirect user to password reset screen
      navigate(`/reset-password${window.location.search}`)
    }
  }, [])

  return <Auth />
}

export default Index;
