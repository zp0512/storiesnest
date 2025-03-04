'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Reset submit status when form is modified
  useEffect(() => {
    setSubmitStatus('idle');
  }, [email, password]);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: ''
    };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log form data (simulating successful login)
      console.log('Login attempt:', { email, password });
      setSubmitStatus('success');
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.15] mix-blend-soft-light pointer-events-none"></div>
      
      {/* Animated gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient-shift pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative">
        {/* Glass effect card */}
        <div className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/10">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-white mb-2">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Or{' '}
              <button
                onClick={() => router.push('/signup')}
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
              >
                create a new account
              </button>
            </p>
          </div>

          {/* ARIA Live Region for Dynamic Updates */}
          <div 
            role="status" 
            aria-live="polite" 
            className="sr-only"
          >
            {submitStatus === 'success' && 'Login successful. Redirecting to dashboard...'}
            {submitStatus === 'error' && 'Login failed. Please check your credentials and try again.'}
            {errors.email && `Email error: ${errors.email}`}
            {errors.password && `Password error: ${errors.password}`}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`appearance-none relative block w-full px-3 py-2 border bg-gray-900/50 backdrop-blur-sm transition-colors duration-200 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                  } placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-1 focus:z-10 sm:text-sm`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p 
                    id="email-error"
                    className="mt-1 text-sm text-red-400 animate-fade-in"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`appearance-none relative block w-full px-3 py-2 border bg-gray-900/50 backdrop-blur-sm transition-colors duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                  } placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-1 focus:z-10 sm:text-sm`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p 
                    id="password-error"
                    className="mt-1 text-sm text-red-400 animate-fade-in"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                  isSubmitting 
                    ? 'bg-emerald-600/50 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900'
                }`}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {submitStatus === 'success' && (
              <div 
                className="rounded-lg bg-emerald-900/50 border border-emerald-500/20 p-4 animate-fade-in backdrop-blur-sm"
                role="alert"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-emerald-200">
                      Login successful! Redirecting to dashboard...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div 
                className="rounded-lg bg-red-900/50 border border-red-500/20 p-4 animate-fade-in backdrop-blur-sm"
                role="alert"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 00-1.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-200">
                      Login failed. Please check your credentials and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
