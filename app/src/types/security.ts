export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Vulnerability {
  id: string;
  cve: string;
  package: string;
  version: string;
  severity: Severity;
  description: string;
  fixVersion?: string;
}

export interface ScanResult {
  id: string;
  imageName: string;
  tag: string;
  timestamp: string;
  status: 'Clean' | 'Vulnerable';
  vulnerabilities: Vulnerability[];
  metrics: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SecurityStats {
  score: string; // A, B, C, D, F
  activeThreats: number;
  policyCompliance: number; // Percentage
  imagesScanned: number;
}
