import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { fadeInUp } from './animations';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative p-6 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-surface-700 transition-all duration-300"
    >
      {/* Gradient glow on hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10",
        gradient
      )} />
      
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        "bg-gradient-to-br",
        gradient
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      <h3 className="text-lg font-semibold text-surface-100 mb-2">{title}</h3>
      <p className="text-sm text-surface-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function StepCard({ number, title, description, icon: Icon }: StepProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-surface-950 border-2 border-primary-500 flex items-center justify-center">
          <span className="text-xs font-bold text-primary-400">{number}</span>
        </div>
      </div>
      <h4 className="text-base font-semibold text-surface-100 mb-2">{title}</h4>
      <p className="text-sm text-surface-400 max-w-[200px]">{description}</p>
    </motion.div>
  );
}

interface StatItemProps {
  value: string;
  label: string;
  delay?: number;
}

export function StatItem({ value, label, delay = 0 }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-1">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-surface-400">{label}</div>
    </motion.div>
  );
}
