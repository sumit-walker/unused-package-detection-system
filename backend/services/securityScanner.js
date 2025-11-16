import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execPromise = promisify(exec);

class SecurityScanner {
  constructor(language) {
    this.language = language;
  }

  async scan(projectPath, language) {
    switch (language) {
      case 'nodejs':
        return await this.scanNodeJS(projectPath);
      case 'python':
        return await this.scanPython(projectPath);
      case 'java':
        return await this.scanJava(projectPath);
      default:
        return [];
    }
  }

  async scanNodeJS(projectPath) {
    try {
      const { stdout } = await execPromise('npm audit --json', {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024
      });
      
      const auditData = JSON.parse(stdout);
      return this.parseNpmAudit(auditData);
    } catch (error) {
      if (error.stderr) {
        try {
          const auditData = JSON.parse(error.stderr);
          return this.parseNpmAudit(auditData);
        } catch (e) {
          return [];
        }
      }
      return [];
    }
  }

  async scanPython(projectPath) {
    try {
      try {
        const { stdout } = await execPromise('pip-audit --format json', {
          cwd: projectPath,
          maxBuffer: 10 * 1024 * 1024
        });
        
        return this.parsePipAudit(JSON.parse(stdout));
      } catch (error) {
        try {
          const { stdout } = await execPromise('safety check --json', {
            cwd: projectPath,
            maxBuffer: 10 * 1024 * 1024
          });
          
          return this.parseSafety(JSON.parse(stdout));
        } catch (e) {
          console.warn('pip-audit and safety not available. Install with: pip install pip-audit');
          return [];
        }
      }
    } catch (error) {
      return [];
    }
  }

  async scanJava(projectPath) {
    try {
      const dependencyCheckPath = path.join(projectPath, 'dependency-check-report.json');
      
      try {
        await fs.access(dependencyCheckPath);
        const data = await fs.readFile(dependencyCheckPath, 'utf8');
        return this.parseDependencyCheck(JSON.parse(data));
      } catch (e) {
        try {
          await execPromise('dependency-check --project test --scan . --format JSON --out .', {
            cwd: projectPath,
            maxBuffer: 50 * 1024 * 1024,
            timeout: 300000
          });
          
          const data = await fs.readFile(dependencyCheckPath, 'utf8');
          return this.parseDependencyCheck(JSON.parse(data));
        } catch (execError) {
          console.warn('OWASP Dependency Check not available. Install from: https://owasp.org/www-project-dependency-check/');
          return [];
        }
      }
    } catch (error) {
      return [];
    }
  }

  parseNpmAudit(data) {
    const vulnerabilities = [];
    
    if (data.vulnerabilities) {
      Object.keys(data.vulnerabilities).forEach(packageName => {
        const vuln = data.vulnerabilities[packageName];
        if (vuln.via && vuln.via.length > 0) {
          vulnerabilities.push({
            package: packageName,
            severity: vuln.severity || 'unknown',
            title: vuln.title || 'Unknown vulnerability',
            severityScore: this.getSeverityScore(vuln.severity),
            via: vuln.via[0] || []
          });
        }
      });
    }
    
    return vulnerabilities.sort((a, b) => b.severityScore - a.severityScore);
  }

  parsePipAudit(data) {
    const vulnerabilities = [];
    
    if (data.vulnerabilities) {
      data.vulnerabilities.forEach(vuln => {
        vulnerabilities.push({
          package: vuln.name,
          severity: this.mapSeverity(vuln.severity),
          title: vuln.id || 'Unknown vulnerability',
          severityScore: this.getSeverityScore(this.mapSeverity(vuln.severity)),
          via: vuln.aliases || []
        });
      });
    }
    
    return vulnerabilities.sort((a, b) => b.severityScore - a.severityScore);
  }

  parseSafety(data) {
    const vulnerabilities = [];
    
    if (Array.isArray(data)) {
      data.forEach(vuln => {
        vulnerabilities.push({
          package: vuln.package || vuln.name,
          severity: this.mapSeverity(vuln.severity),
          title: vuln.vulnerability_id || 'Unknown vulnerability',
          severityScore: this.getSeverityScore(this.mapSeverity(vuln.severity)),
          via: []
        });
      });
    }
    
    return vulnerabilities.sort((a, b) => b.severityScore - a.severityScore);
  }

  parseDependencyCheck(data) {
    const vulnerabilities = [];
    
    if (data.dependencies) {
      data.dependencies.forEach(dep => {
        if (dep.vulnerabilities) {
          dep.vulnerabilities.forEach(vuln => {
            vulnerabilities.push({
              package: dep.packages?.[0]?.id || dep.fileName,
              severity: this.mapCvssSeverity(vuln.cvssv3?.baseSeverity || vuln.severity),
              title: vuln.name || 'Unknown vulnerability',
              severityScore: this.getSeverityScore(this.mapCvssSeverity(vuln.cvssv3?.baseSeverity || vuln.severity)),
              via: []
            });
          });
        }
      });
    }
    
    return vulnerabilities.sort((a, b) => b.severityScore - a.severityScore);
  }

  mapSeverity(severity) {
    const mapping = {
      'CRITICAL': 'critical',
      'HIGH': 'high',
      'MEDIUM': 'moderate',
      'MODERATE': 'moderate',
      'LOW': 'low',
      'INFO': 'info'
    };
    return mapping[severity?.toUpperCase()] || 'unknown';
  }

  mapCvssSeverity(severity) {
    return this.mapSeverity(severity);
  }

  getSeverityScore(severity) {
    const scores = {
      'critical': 5,
      'high': 4,
      'moderate': 3,
      'low': 2,
      'info': 1,
      'unknown': 0
    };
    return scores[severity?.toLowerCase()] || 0;
  }
}

export { SecurityScanner };