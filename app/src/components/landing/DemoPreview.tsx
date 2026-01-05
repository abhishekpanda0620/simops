import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export function DemoPreview() {
  return (
    <section className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            See It In Action
          </h2>
          <p className="text-sm sm:text-base text-surface-400 max-w-2xl mx-auto">
            Watch how Kubernetes components interact in real-time through our interactive topology view.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-surface-700 bg-surface-900 shadow-2xl shadow-primary-500/10"
        >
          {/* Mock browser chrome */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-surface-800 border-b border-surface-700">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-error-500/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-warning-500/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success-500/60" />
            </div>
            <div className="flex-1 mx-2 sm:mx-4">
              <div className="bg-surface-700 rounded-md px-3 py-1 text-xs text-surface-400 max-w-xs mx-auto truncate">
                simops.dev/topology
              </div>
            </div>
          </div>
          
          {/* Preview content */}
          <div className="relative bg-gradient-to-br from-surface-900 to-surface-950 p-4 sm:p-6 md:p-8 min-h-[200px] sm:min-h-[280px] md:min-h-[320px]">
            <div className="flex flex-col items-center justify-between h-full gap-4 sm:gap-6">
              {/* Control Plane */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary-500/20 border border-primary-500/40 text-xs sm:text-sm text-primary-300">
                  Control Plane
                </div>
                <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded bg-accent-500/20 border border-accent-500/40 text-[10px] sm:text-xs text-accent-300">
                  API Server
                </div>
              </motion.div>
              
              {/* Connection indicator */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="w-px h-8 sm:h-12 bg-gradient-to-b from-primary-500/40 to-surface-600"
              />
              
              {/* Worker Nodes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2 sm:gap-4"
              >
                {['Node 1', 'Node 2'].map((node, i) => (
                  <motion.div
                    key={node}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 rounded bg-surface-800 border border-surface-600 text-[10px] sm:text-xs text-surface-300"
                  >
                    <div className="mb-1 text-center">{node}</div>
                    <div className="flex justify-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success-500 animate-pulse" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </motion.div>
                ))}
                {/* Third node only on larger screens */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="hidden sm:block px-3 py-2 rounded bg-surface-800 border border-surface-600 text-xs text-surface-300"
                >
                  <div className="mb-1 text-center">Node 3</div>
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 to-transparent pointer-events-none" />
          </div>
          
          {/* View Demo button */}
          <div className="flex justify-center py-4 sm:py-6 bg-surface-900/80 border-t border-surface-800">
            <Link
              to="/topology"
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm sm:text-base transition-colors"
            >
              <Play className="w-4 h-4" />
              Launch Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
