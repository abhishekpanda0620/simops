import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight, Github, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, register, error, clearError, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (isRegisterMode && !name) {
      setFormError('Please enter your name');
      return;
    }

    try {
      if (isRegisterMode) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch {
      // Error is handled by context
    }
  };

  const handleGuestLogin = async () => {
    setFormError(null);
    clearError();
    try {
      // Use the seeded demo account
      await login('test@example.com', 'password');
    } catch {
      setFormError('Guest login unavailable. Please register or try again.');
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setFormError(null);
    clearError();
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-900/50 via-surface-950 to-surface-950 opacity-80" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-surface-900/50 backdrop-blur-xl border border-surface-800 rounded-2xl shadow-2xl p-8">
          
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-100 mb-2">SimOps Academy</h1>
            <p className="text-surface-400 text-sm">
              {isRegisterMode ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          {/* Error display */}
          {(error || formError) && (
            <div className="mb-4 p-3 bg-error-500/10 border border-error-500/30 rounded-lg text-error-400 text-sm">
              {error || formError}
            </div>
          )}

          {/* Login/Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Guest Login Option */}
          {!isRegisterMode && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-surface-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface-900 px-2 text-surface-500">or</span>
                </div>
              </div>

              <Button 
                variant="secondary"
                className="w-full gap-2"
                size="lg"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                Continue as Guest
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-surface-400 hover:text-primary-400 transition-colors"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          {/* SSO Options (disabled for now) */}
          <div className="mt-6">
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-surface-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-900 px-2 text-surface-500">Coming soon</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button variant="secondary" className="w-full gap-2" disabled>
                <Github className="w-4 h-4" />
                GitHub
              </Button>
              <Button variant="secondary" className="w-full gap-2" disabled>
                <Mail className="w-4 h-4" />
                Google
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-surface-500">
            <p>By continuing, you acknowledge this is a <span className="text-accent-400">Beta Preview</span>.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
