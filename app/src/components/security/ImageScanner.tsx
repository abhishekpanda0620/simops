import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Search, Loader2, ShieldAlert, CheckCircle, Box } from 'lucide-react';
import type { ScanResult } from '@/types/security';
import { mockScanResults } from '@/data/security';

export function ImageScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);

  const totalLayers = 6;

  const startScan = () => {
    setIsScanning(true);
    setCurrentLayer(0);
    setResult(null);
  };

  useEffect(() => {
    if (isScanning) {
      if (currentLayer < totalLayers) {
        const timer = setTimeout(() => {
          setCurrentLayer(prev => prev + 1);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // scan complete
        const timer = setTimeout(() => {
          setIsScanning(false);
          setResult(mockScanResults[0]);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isScanning, currentLayer]);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-surface-800 bg-surface-900/50 flex justify-between items-center">
        <h3 className="font-semibold text-surface-100">Container Image Scanner</h3>
        {!isScanning && !result && (
          <Button size="sm" onClick={startScan} className="gap-2">
            <Search className="w-4 h-4" />
            Scan New Image
          </Button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {!isScanning && !result && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center mb-6">
              <Box className="w-10 h-10 text-surface-600" />
            </div>
            <h4 className="text-xl font-medium text-surface-200 mb-2">Ready to Scan</h4>
            <p className="text-surface-400 max-w-sm mb-8">
              Analyze container images for CVEs, exposed secrets, and configuration issues (simulating Trivy scan).
            </p>
            <Button size="lg" onClick={startScan} className="gap-2">
              <Search className="w-5 h-5" />
              Start Vulnerability Scan
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="max-w-md mx-auto py-12">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <Loader2 className="w-full h-full text-primary-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-surface-200">
                  {Math.round((currentLayer / totalLayers) * 100)}%
                </div>
              </div>
              <h4 className="text-lg font-medium text-surface-200 mb-1">Scanning Layers...</h4>
              <p className="text-surface-400 text-sm">
                Analyzing layer {currentLayer} of {totalLayers}
              </p>
              <div className="w-full h-2 bg-surface-800 rounded-full mt-6 overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300 ease-out"
                  style={{ width: `${(currentLayer / totalLayers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border flex items-center gap-4 ${
              result.status === 'Clean' ? 'bg-success-500/10 border-success-500/20' : 'bg-error-500/10 border-error-500/20'
            }`}>
              {result.status === 'Clean' ? (
                <CheckCircle className="w-8 h-8 text-success-400" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-error-400" />
              )}
              <div className="flex-1">
                <h4 className={`text-lg font-bold ${
                  result.status === 'Clean' ? 'text-success-300' : 'text-error-300'
                }`}>
                  Scan Complete: {result.status}
                </h4>
                <p className="text-sm text-surface-300">
                  Found {result.metrics.critical} critical, {result.metrics.high} high vulnerabilities.
                </p>
              </div>
              <Button onClick={() => setResult(null)} variant="secondary" size="sm">
                Scan Again
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-surface-300 text-sm uppercase tracking-wider">Vulnerabilities</h3>
              {result.vulnerabilities.map(vuln => (
                <div key={vuln.id} className="p-4 rounded-lg bg-surface-800 border border-surface-700 hover:border-surface-600 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded textxs font-bold ${
                          vuln.severity === 'Critical' ? 'bg-error-500/20 text-error-400' :
                          vuln.severity === 'High' ? 'bg-warning-500/20 text-warning-400' :
                          'bg-primary-500/20 text-primary-400'
                        }`}>
                          {vuln.severity}
                        </span>
                        <span className="font-mono text-sm text-surface-300">{vuln.cve}</span>
                      </div>
                      <h5 className="font-medium text-surface-200">{vuln.package} <span className="text-surface-500">v{vuln.version}</span></h5>
                      <p className="text-sm text-surface-400 mt-1">{vuln.description}</p>
                    </div>
                    {vuln.fixVersion && (
                      <div className="text-xs text-right shrink-0">
                        <div className="text-surface-500">Fixed in</div>
                        <div className="font-mono text-success-400">{vuln.fixVersion}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
