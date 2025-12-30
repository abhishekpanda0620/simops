import type { ScanResult, SecurityStats, Vulnerability } from '@/types/security';

export const mockSecurityStats: SecurityStats = {
  score: 'B-',
  activeThreats: 12,
  policyCompliance: 85,
  imagesScanned: 143,
};

const commonVulns: Vulnerability[] = [
  {
    id: 'V-001',
    cve: 'CVE-2023-44487',
    package: 'nginx',
    version: '1.24.0',
    severity: 'High',
    description: 'HTTP/2 Rapid Reset vulnerability allowing DDoS attacks.',
    fixVersion: '1.25.3'
  },
  {
    id: 'V-002',
    cve: 'CVE-2023-4863',
    package: 'libwebp',
    version: '1.3.1',
    severity: 'Critical',
    description: 'Heap buffer overflow in WebP allows arbitrary code execution.',
    fixVersion: '1.3.2'
  },
  {
    id: 'V-003',
    cve: 'CVE-2023-52424',
    package: 'wireless-regdb',
    version: '2023.05.03',
    severity: 'Medium',
    description: 'Weak encryption algorithm used in default configuration.',
  }
];

export const mockScanResults: ScanResult[] = [
  {
    id: 'scan-1',
    imageName: 'frontend-app',
    tag: 'latest',
    timestamp: new Date().toISOString(),
    status: 'Vulnerable',
    vulnerabilities: commonVulns,
    metrics: {
      critical: 1,
      high: 1,
      medium: 1,
      low: 0
    }
  }
];
