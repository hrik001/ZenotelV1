import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building2 } from 'lucide-react';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleTestSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login();
      
      // Wait a moment for auth state to sync with backend
      await new Promise(r => setTimeout(r, 500));
      
      window.location.href = '/';
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-stone-200">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-teal-50 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
            <Building2 className="w-6 h-6 text-teal-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-stone-900">Welcome to Zenotel</CardTitle>
          <CardDescription className="text-stone-500">
            Sign in to manage your hospitality properties, bookings and guests in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                {errorMsg}
              </div>
            )}
            
            <Button onClick={handleTestSignIn} className="w-full bg-stone-900 hover:bg-stone-800 text-white" isLoading={isLoading}>
              Test Sign In (Bypass Auth)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
