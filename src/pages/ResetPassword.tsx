import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Password updated successfully! Redirecting...')
      setTimeout(() => navigate('/auth'), 3000)
    }

    setLoading(false)
  }

  return (
    <div>
      <h1>Reset Your Password</h1>
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleReset} disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
      {message && <p>{message}</p>}
    </div>
  )
}

export default ResetPassword