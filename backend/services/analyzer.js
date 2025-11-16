import { NodeJSParser } from '../parsers/nodejsParser.js';
import { PythonParser } from '../parsers/pythonParser.js';
import { JavaParser } from '../parsers/javaParser.js';
import { NodeJSAnalyzer } from '../analyzers/nodejsAnalyzer.js';
import { PythonAnalyzer } from '../analyzers/pythonAnalyzer.js';
import { JavaAnalyzer } from '../analyzers/javaAnalyzer.js';
import { SecurityScanner } from './securityScanner.js';
import { OutdatedChecker } from './outdatedChecker.js';
import { Reporter } from './reporter.js';
import fs from 'fs/promises';
import path from 'path';

class ProjectAnalyzer {
  constructor(language = null) {
    this.language = language;
    this.parser = null;
    this.fileAnalyzer = null;
    this.securityScanner = null;
    this.outdatedChecker = null;
    this.reporter = new Reporter();
  }

  async detectLanguage(projectPath) {
    // Check for language-specific files
    const checks = [
      { file: 'package.json', language: 'nodejs' },
      { file: 'requirements.txt', language: 'python' },
      { file: 'setup.py', language: 'python' },
      { file: 'pyproject.toml', language: 'python' },
      { file: 'pom.xml', language: 'java' },
      { file: 'build.gradle', language: 'java' },
      { file: 'build.gradle.kts', language: 'java' }
    ];

    for (const check of checks) {
      try {
        await fs.access(path.join(projectPath, check.file));
        return check.language;
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Default to nodejs if nothing detected
    return 'nodejs';
  }

  async initialize(projectPath) {
    // Auto-detect language if not provided
    if (!this.language) {
      this.language = await this.detectLanguage(projectPath);
    }

    this.parser = this.getParser();
    this.fileAnalyzer = this.getFileAnalyzer();
    this.securityScanner = new SecurityScanner(this.language);
    this.outdatedChecker = new OutdatedChecker(this.language);
  }

  getParser() {
    switch (this.language) {
      case 'nodejs':
        return new NodeJSParser();
      case 'python':
        return new PythonParser();
      case 'java':
        return new JavaParser();
      default:
        throw new Error(`Unsupported language: ${this.language}`);
    }
  }

  getFileAnalyzer() {
    switch (this.language) {
      case 'nodejs':
        return new NodeJSAnalyzer();
      case 'python':
        return new PythonAnalyzer();
      case 'java':
        return new JavaAnalyzer();
      default:
        throw new Error(`Unsupported language: ${this.language}`);
    }
  }

  async analyze(projectPath) {
    try {
      // Initialize parser and analyzer based on detected/selected language
      await this.initialize(projectPath);
      
      // Parse dependencies
      const dependencies = await this.parser.parse(projectPath);
      
      // Analyze file usage
      const usedDependencies = await this.fileAnalyzer.analyze(projectPath);
      
      // Compare and identify unused
      const comparison = this.compareDependencies(dependencies, usedDependencies);
      
      // Run security scans
      const vulnerabilities = await this.securityScanner.scan(projectPath, this.language);
      
      // Check for outdated packages
      const outdated = await this.outdatedChecker.check(projectPath, dependencies, this.language);
      
      // Calculate storage impact
      const storageImpact = await this.calculateStorageImpact(
        projectPath, 
        comparison.unused,
        this.language
      );
      
      // Generate report
      return this.reporter.generate({
        language: this.language,
        dependencies,
        usedDependencies,
        comparison,
        vulnerabilities,
        outdated,
        storageImpact,
        projectPath
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  compareDependencies(declared, used) {
    // Normalize package names for comparison (lowercase, trim whitespace)
    const normalize = (name) => name.toLowerCase().trim();
    
    const declaredMap = new Map();
    declared.forEach(dep => {
      const normalized = normalize(dep.name);
      if (!declaredMap.has(normalized)) {
        declaredMap.set(normalized, dep);
      }
    });
    
    const usedSet = new Set(used.map(d => normalize(d.name)));
    
    // Find unused: packages declared but not used
    const unused = [];
    declaredMap.forEach((dep, normalizedName) => {
      if (!usedSet.has(normalizedName)) {
        unused.push(dep);
      }
    });
    
    // Find missing: packages used but not declared
    const missing = used.filter(dep => {
      const normalized = normalize(dep.name);
      return !declaredMap.has(normalized);
    });
    
    return {
      total: declared.length,
      used: used.length,
      unused: unused,
      missing: missing
    };
  }

  async calculateStorageImpact(projectPath, unusedDeps, language) {
    // Language-specific average package sizes (MB)
    const avgSizes = {
      nodejs: 5,
      python: 3,
      java: 10
    };
    
    const avgPackageSize = avgSizes[language] || 5;
    const totalMB = unusedDeps.length * avgPackageSize;
    
    return {
      packages: unusedDeps.length,
      estimatedSavingsMB: totalMB.toFixed(2),
      estimatedSavingsGB: (totalMB / 1024).toFixed(3)
    };
  }
}

export { ProjectAnalyzer };