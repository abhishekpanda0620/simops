import { motion } from 'framer-motion';
import { Network, GitBranch, Cpu, Layers, BookOpen, Play, Eye } from 'lucide-react';
import { 
  HeroSection, 
  DemoPreview, 
  Footer, 
  FeatureCard, 
  StepCard, 
  StatItem,
  staggerContainer 
} from '@/components/landing';

// Feature data
const features = [
  {
    icon: Network,
    title: "Kubernetes Topology",
    description: "Interactive visualization of Control Plane, Worker Nodes, and real-time traffic flows.",
    gradient: "from-primary-500/20 to-primary-600/20"
  },
  {
    icon: GitBranch,
    title: "CI/CD Pipelines",
    description: "Simulate build, test, and deploy workflows. See how failures cascade through stages.",
    gradient: "from-accent-500/20 to-accent-600/20"
  },
  {
    icon: Cpu,
    title: "Control Plane Logic",
    description: "Watch API Server, etcd, Scheduler, and Controllers work together in real-time.",
    gradient: "from-success-500/20 to-success-600/20"
  },
  {
    icon: Layers,
    title: "Workload Simulations",
    description: "Deploy StatefulSets, DaemonSets, Jobs, and see HPA autoscaling in action.",
    gradient: "from-warning-500/20 to-warning-600/20"
  }
];

// Stats data
const stats = [
  { value: '15+', label: 'Scenarios' },
  { value: '6', label: 'Learning Modules' },
  { value: '100%', label: 'Interactive' },
  { value: 'Free', label: 'To Start' },
];

// Steps data
const steps = [
  { number: 1, title: "Choose a Topic", description: "Select from K8s, CI/CD, or Security modules", icon: BookOpen },
  { number: 2, title: "Run Simulation", description: "Watch the system respond in real-time", icon: Play },
  { number: 3, title: "Understand the Flow", description: "See exactly how components interact", icon: Eye }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 overflow-x-hidden">
      {/* Hero */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="relative py-8 sm:py-12 px-4 sm:px-6 md:px-12 lg:px-20 border-y border-surface-800 bg-surface-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
          >
            {stats.map((stat, i) => (
              <StatItem key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <DemoPreview />

      {/* Features */}
      <section className="relative py-16 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Everything You Need to{' '}
              <span className="text-gradient">Master DevOps</span>
            </h2>
            <p className="text-sm sm:text-base text-surface-400 max-w-2xl mx-auto px-2">
              Interactive modules covering the full DevOps spectrum, from container orchestration to security.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 lg:px-20 bg-surface-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">How It Works</h2>
            <p className="text-sm sm:text-base text-surface-400">Three simple steps to accelerate your learning</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-2/3 h-0.5 z-0">
              <div className="w-full h-full bg-gradient-to-r from-primary-500/0 via-primary-500/40 to-primary-500/0" />
            </div>
            
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-8"
            >
              {steps.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
