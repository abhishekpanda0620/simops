import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = () => {
    setIsLoading(true);
    // Simulate a brief delay for effect
    setTimeout(() => {
      onLogin();
    }, 800);
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
            <p className="text-surface-400 text-sm">Interactive DevOps Simulations & Labs</p>
          </div>

          {/* Login Actions */}
          <div className="space-y-4">
            <Button 
              className="w-full gap-2 relative overflow-hidden group"
              size="lg"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? 'Entering...' : 'Continue as Guest'} 
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
              {/* Button shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-surface-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-900 px-2 text-surface-500">Or sign in with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full gap-2" disabled title="Coming Soon">
                <Github className="w-4 h-4" />
                GitHub
              </Button>
              <Button variant="secondary" className="w-full gap-2" disabled title="Coming Soon">
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-surface-500">
            <p>By continuing, you acknowledge that this is a <span className="text-accent-400">Beta Preview</span> version.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
