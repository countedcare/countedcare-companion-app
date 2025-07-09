
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AuthHeader from '@/components/auth/AuthHeader';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
  // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !searchParams.get('access_token') && !searchParams.get('type')) {
        navigate('/');
      }
    };
    
    checkUser();

    // Check URL parameters for password recovery
    const type = searchParams.get('type');
    
    console.log('URL params:', { type, hasAccessToken: !!searchParams.get('access_token') });

    if (type === 'recovery') {
      console.log('Password recovery detected from URL');
      setIsPasswordRecovery(true);
      toast({
        title: "Password Reset",
        description: "Please enter your new password below.",
      });
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session && !isPasswordRecovery) {
        navigate('/');
      }
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event detected');
        setIsPasswordRecovery(true);
        toast({
          title: "Password Reset Ready",
          description: "You can now enter a new password below.",
        });
      }
    });

    // Check for auth errors
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    
    if (error) {
      console.error('Auth error from URL:', error, error_description);
      toast({
        title: "Authentication Error",
        description: error_description || error,
        variant: "destructive",
      });
    }

    return () => subscription.unsubscribe();
  }, [navigate, searchParams, toast, isPasswordRecovery]);

  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
        <AuthHeader />
        <Card className="w-full max-w-md">
          <PasswordResetForm 
            onSuccess={() => {
              setIsPasswordRecovery(false);
              toast({
                title: "Password Updated Successfully!",
                description: "Your password has been updated. You are now signed in.",
              });
              // The auth state change will handle navigation to dashboard
            }}
          />
        </Card>
        <div className="mt-4 text-sm text-gray-500">
          <p>© 2025 CountedCare. All rights reserved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <AuthHeader />

      <Card className="w-full max-w-md">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              setLoading={setLoading}
            />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              name={name}
              setName={setName}
              loading={loading}
              setLoading={setLoading}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Auth;
