import { motion } from 'framer-motion';

// Animated background with gradient orbs
export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}

// Floating K8s component labels
export function FloatingNodes() {
  const nodes = [
    { label: 'API Server', x: '15%', y: '20%', delay: 0 },
    { label: 'etcd', x: '75%', y: '25%', delay: 0.5 },
    { label: 'Scheduler', x: '25%', y: '70%', delay: 1 },
    { label: 'Pod', x: '70%', y: '65%', delay: 1.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          className="absolute px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50 text-xs text-surface-400 backdrop-blur-sm"
          style={{ left: node.x, top: node.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            delay: node.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {node.label}
        </motion.div>
      ))}
    </div>
  );
}
