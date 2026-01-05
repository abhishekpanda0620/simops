import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Github, ChevronRight, ArrowRight, Play } from 'lucide-react';
import { AnimatedBackground, FloatingNodes } from './Decorations';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <FloatingNodes />
      
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold">SimOps</span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3">
          <a 
            href="https://github.com/abhishekpanda0620/simops" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
          <Link 
            to="/login"
            className="hidden sm:block px-4 py-2 text-sm font-medium text-surface-300 hover:text-surface-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-surface-900/80 border border-surface-700 mb-6 sm:mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-xs sm:text-sm text-surface-300">Interactive DevOps Learning</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
            Learn DevOps by{' '}
            <span className="text-gradient">Doing</span>,
            <br className="hidden sm:block" />
            {' '}Not Just Watching
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Visualize Kubernetes internals, simulate CI/CD pipelines, and understand 
            complex DevOps concepts through interactive simulations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            <Link
              to="/dashboard"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-base sm:text-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/topology"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-surface-800 border border-surface-700 text-surface-200 font-semibold text-base sm:text-lg hover:bg-surface-700 hover:border-surface-600 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              View Demo
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-6 h-6 text-surface-500 rotate-90" />
        </motion.div>
      </div>
    </section>
  );
}
