import { useState } from 'react';
import { Header } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { Shield, AlertTriangle, FileCheck, Search, Activity, Lock } from 'lucide-react';
import { mockSecurityStats } from '@/data/security';
import { ImageScanner } from '@/components/security/ImageScanner';
import { AdmissionController } from '@/components/security/AdmissionController';

export function DevSecOpsPage() {
  const [activeTool, setActiveTool] = useState<'scanner' | 'opa'>('scanner');
  const stats = mockSecurityStats;

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="DevSecOps Security" 
        subtitle="Vulnerability Management & Policy Enforcement (Powered by Trivy & OPA concepts)" 
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Score Card */}
            <Card className="p-4 border-l-4 border-l-primary-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-surface-400 font-medium">Security Score</p>
                  <h3 className="text-3xl font-bold text-surface-100 mt-1">{stats.score}</h3>
                </div>
                <div className="p-2 rounded-lg bg-surface-800">
                  <Shield className="w-5 h-5 text-primary-400" />
                </div>
              </div>
              <p className="text-xs text-surface-500 mt-2">Based on CIS benchmarks</p>
            </Card>

            {/* Threats Card */}
            <Card className="p-4 border-l-4 border-l-error-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-surface-400 font-medium">Active Threats</p>
                  <h3 className="text-3xl font-bold text-surface-100 mt-1">{stats.activeThreats}</h3>
                </div>
                <div className="p-2 rounded-lg bg-surface-800">
                  <AlertTriangle className="w-5 h-5 text-error-400" />
                </div>
              </div>
              <p className="text-xs text-surface-500 mt-2">Critical & High CVEs</p>
            </Card>

            {/* Compliance Card */}
            <Card className="p-4 border-l-4 border-l-success-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-surface-400 font-medium">Compliance</p>
                  <h3 className="text-3xl font-bold text-surface-100 mt-1">{stats.policyCompliance}%</h3>
                </div>
                <div className="p-2 rounded-lg bg-surface-800">
                  <FileCheck className="w-5 h-5 text-success-400" />
                </div>
              </div>
              <p className="text-xs text-surface-500 mt-2">OPA Policy adherence</p>
            </Card>

            {/* Scans Card */}
            <Card className="p-4 border-l-4 border-l-warning-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-surface-400 font-medium">Images Scanned</p>
                  <h3 className="text-3xl font-bold text-surface-100 mt-1">{stats.imagesScanned}</h3>
                </div>
                <div className="p-2 rounded-lg bg-surface-800">
                  <Search className="w-5 h-5 text-warning-400" />
                </div>
              </div>
              <p className="text-xs text-surface-500 mt-2">Last 30 days</p>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Tools */}
            <div className="space-y-6">
              <Card>
                <div className="p-4 border-b border-surface-800">
                  <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-400" />
                    Security Tools
                  </h3>
                </div>
                <div className="p-2">
                  <Button 
                    variant={activeTool === 'scanner' ? 'primary' : 'ghost'} 
                    className="w-full justify-start gap-3 p-3 h-auto mb-2"
                    onClick={() => setActiveTool('scanner')}
                  >
                    <div className={`p-2 rounded ${
                      activeTool === 'scanner' ? 'bg-white/20 text-white' : 'bg-primary-500/10 text-primary-400'
                    }`}>
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className={`font-medium ${activeTool === 'scanner' ? 'text-white' : 'text-surface-100'}`}>Image Scanner</div>
                      <div className={`text-xs ${activeTool === 'scanner' ? 'text-blue-100' : 'text-surface-400'}`}>Scan registry images for CVEs (Clair/Trivy)</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={activeTool === 'opa' ? 'primary' : 'ghost'} 
                    className="w-full justify-start gap-3 p-3 h-auto"
                    onClick={() => setActiveTool('opa')}
                  >
                    <div className={`p-2 rounded ${
                      activeTool === 'opa' ? 'bg-white/20 text-white' : 'bg-accent-500/10 text-accent-400'
                    }`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className={`font-medium ${activeTool === 'opa' ? 'text-white' : 'text-surface-100'}`}>Admission Control</div>
                      <div className={`text-xs ${activeTool === 'opa' ? 'text-purple-100' : 'text-surface-400'}`}>Manage OPA Gatekeeper policies</div>
                    </div>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Active Simulation */}
            <div className="lg:col-span-2">
              {activeTool === 'scanner' ? <ImageScanner /> : <AdmissionController />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
