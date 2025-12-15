import { Header } from '@/components/layout';
import { Network, GitBranch, Box, Lock, Terminal, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { motion } from 'framer-motion';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: typeof Network;
  to: string;
  status: 'available' | 'coming-soon' | 'beta';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  tags: string[];
}

function ModuleCard({ title, description, icon: Icon, to, status, difficulty, duration, tags }: ModuleCardProps) {
  const isAvailable = status !== 'coming-soon';

  return (
    <motion.div
      whileHover={isAvailable ? { scale: 1.02 } : {}}
      className={cn(
        "relative flex flex-col p-6 rounded-xl border transition-all duration-300",
        isAvailable 
          ? "bg-surface-800 border-surface-700 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer" 
          : "bg-surface-900/50 border-surface-800 opacity-70 cursor-not-allowed"
      )}
    >
      <Link to={isAvailable ? to : '#'} className={cn(!isAvailable && "pointer-events-none")}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg flex items-center justify-center",
            isAvailable ? "bg-primary-500/10 text-primary-400" : "bg-surface-800 text-surface-500"
          )}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex gap-2">
            {status === 'coming-soon' && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-surface-800 text-surface-400 border border-surface-700">
                Coming Soon
              </span>
            )}
            {status === 'beta' && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">
                Beta
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 mb-6">
          <h3 className={cn("text-xl font-bold mb-2", isAvailable ? "text-surface-100" : "text-surface-400")}>
            {title}
          </h3>
          <p className="text-sm text-surface-400 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex items-center gap-3 text-xs text-surface-500 mb-4">
            <span className={cn(
              "px-2 py-0.5 rounded",
              difficulty === 'Beginner' && "bg-success-500/10 text-success-400",
              difficulty === 'Intermediate' && "bg-warning-500/10 text-warning-400",
              difficulty === 'Advanced' && "bg-error-500/10 text-error-400",
            )}>
              {difficulty}
            </span>
            <span>•</span>
            <span>{duration}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-1 rounded bg-surface-950 text-surface-400 border border-surface-800">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function DashboardPage() {
  const modules: ModuleCardProps[] = [
    {
      title: "Kubernetes Architecture",
      description: "Interactive visualization of K8s Control Plane, Worker Nodes, and traffic flow. Understand how components communicate.",
      icon: Network,
      to: "/topology",
      status: "available",
      difficulty: "Intermediate",
      duration: "2-3 Hours",
      tags: ["k8s", "control-plane", "networking"]
    },
    {
      title: "CI/CD Pipelines",
      description: "Visual simulation of build, test, and deploy workflows. Learn how code goes from commit to production.",
      icon: GitBranch,
      to: "/pipeline",
      status: "coming-soon",
      difficulty: "Beginner",
      duration: "1.5 Hours",
      tags: ["cicd", "automation", "devops"]
    },
    {
      title: "Container Fundamentals",
      description: "Hands-on labs for Docker basics, container lifecycle, and resource isolation mechanics.",
      icon: Box,
      to: "/labs",
      status: "coming-soon",
      difficulty: "Beginner",
      duration: "1 Hour",
      tags: ["docker", "containers", "process"]
    },
    {
      title: "DevSecOps Security",
      description: "Learn about image scanning, policy enforcement, and secure supply chain practices.",
      icon: Lock,
      to: "/security",
      status: "coming-soon",
      difficulty: "Advanced",
      duration: "4 Hours",
      tags: ["security", "policy", "scanning"]
    },
    {
      title: "Linux & Shell Scripting",
      description: "Master the command line. Interactive terminal scenarios for file systems, permissions, and scripting.",
      icon: Terminal,
      to: "/shell",
      status: "coming-soon",
      difficulty: "Beginner",
      duration: "5 Hours",
      tags: ["linux", "bash", "cli"]
    },
    {
      title: "Cloud Infrastructure",
      description: "Understanding IaC with Terraform. Provisioning AWS/Azure resources visually.",
      icon: Cloud,
      to: "/iac",
      status: "coming-soon",
      difficulty: "Intermediate",
      duration: "3 Hours",
      tags: ["terraform", "aws", "iac"]
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="Learning Modules" 
        subtitle="Select a topic to begin your interactive DevOps journey." 
      />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-primary-900/40 to-accent-900/40 border border-primary-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to SimOps Academy</h2>
              <p className="text-surface-200 max-w-2xl text-lg">
                The interactive platform for visualizing and mastering complex DevOps concepts. 
                Move beyond static diagrams—experiment with live simulations.
              </p>
            </div>
            {/* Decorative bg elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 right-20 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl translate-y-1/2" />
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
