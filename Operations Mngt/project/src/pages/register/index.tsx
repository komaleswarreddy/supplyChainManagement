import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/providers/auth-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const { isAuthenticated, register, isLoading, error } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    department: '',
    title: '',
    phoneNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      setFormError('Password must be at least 6 characters and contain uppercase, lowercase, number, and special character');
      return;
    }

    const registerData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      department: formData.department || undefined,
      title: formData.title || undefined,
      phoneNumber: formData.phoneNumber || undefined,
    };

    const result = await register(registerData);
    if (!result.success) {
      setFormError(result.error || 'Registration failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-xl border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up to get started
          </p>
        </div>

        {(error || formError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {formError || error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              At least 6 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Job title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
