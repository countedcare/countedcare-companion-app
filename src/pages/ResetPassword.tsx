import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import AuthHeader from '@/components/auth/AuthHeader'
import PasswordResetForm from '@/components/auth/PasswordResetForm'
import { supabase } from '@/integrations/supabase/client'

const ResetPassword = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [isValidReset, setIsValidReset] = useState(false)

  useEffect(() => {
    // Check if we have valid reset parameters
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')
    
    console.log('Reset password params:', { type, hasAccessToken: !!accessToken })

    if (type === 'recovery' && accessToken && refreshToken) {
      setIsValidReset(true)
      // Set up the session for password reset
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error('Session setup error:', error)
          toast({
            title: "Invalid Reset Link",
            description: "This password reset link is invalid or expired. Please request a new one.",
            variant: "destructive",
          })
          navigate('/auth')
        }
      })
    } else {
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or expired. Please request a new one.",
        variant: "destructive",
      })
      navigate('/auth')
    }
  }, [searchParams, navigate, toast])

  if (!isValidReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <AuthHeader />
      <Card className="w-full max-w-md">
        <PasswordResetForm 
          onSuccess={() => {
            toast({
              title: "Password Updated Successfully!",
              description: "Your password has been updated. You are now signed in.",
            })
            navigate('/dashboard')
          }}
        />
      </Card>
      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. All rights reserved.</p>
      </div>
    </div>
  )
}

export default ResetPassword