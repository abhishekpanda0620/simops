import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-800 py-8 sm:py-12 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-sm sm:text-base font-semibold">SimOps</span>
          <span className="text-surface-500 text-xs sm:text-sm">© {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-surface-400">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-surface-100 transition-colors">
            GitHub
          </a>
          <Link to="/labs" className="hover:text-surface-100 transition-colors">
            Labs
          </Link>
          <Link to="/pipeline" className="hover:text-surface-100 transition-colors">
            Pipeline
          </Link>
        </div>
      </div>
    </footer>
  );
}
