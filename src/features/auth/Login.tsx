import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Building2 } from 'lucide-react';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      await login(email);
      // Let ProtectedRoute or App routing decide where to go, usually "/" which redirects to onboarding if needed
      navigate('/');
    } catch (error) {
      console.error(error);
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
          <CardTitle className="text-2xl font-bold text-stone-900">Welcome to Bookzee</CardTitle>
          <CardDescription className="text-stone-500">
            Sign in to manage your hospitality properties, bookings and guests in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@valleyview.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in to Workspace
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-stone-100 pt-6 text-sm text-stone-500">
          <p>Don't have an account? Entering any email will create a demo account.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
