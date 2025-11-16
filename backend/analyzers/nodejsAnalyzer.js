import { glob } from 'glob';
import fs from 'fs/promises';

import  path from 'path';

class NodeJSAnalyzer {
  constructor() {
    this.ignorePatterns = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/frontend/**',  // Exclude frontend directory when scanning root
      '**/example-project/**',
      '**/tests/**',
      '**/testsprite_tests/**'
    ];
  }

  async analyze(projectPath) {
    const files = await this.findSourceFiles(projectPath);
    const usedDependencies = new Map();
    
    // Scan JavaScript/TypeScript files for imports
    for (const file of files) {
      const imports = await this.extractImports(file);
      imports.forEach(imp => {
        if (!usedDependencies.has(imp.name)) {
          usedDependencies.set(imp.name, []);
        }
        usedDependencies.get(imp.name).push({
          file: path.relative(projectPath, file),
          line: imp.line
        });
      });
    }
    
    // Scan CSS files for Tailwind directives
    await this.checkCSSFiles(projectPath, usedDependencies);
    
    // Scan configuration files
    await this.checkConfigFiles(projectPath, usedDependencies);
    
    // Check package.json scripts for build-time dependencies
    await this.checkPackageScripts(projectPath, usedDependencies);
    
    // Handle special cases (peer dependencies, etc.)
    this.handleSpecialCases(usedDependencies);
    
    // Convert map to array
    return Array.from(usedDependencies.entries()).map(([name, locations]) => ({
      name,
      locations
    }));
  }

  async findSourceFiles(projectPath) {
    const patterns = [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx'
    ];
    
    const allFiles = [];
    
    for (const pattern of patterns) {
      try {
        const files = await glob(pattern, {
          cwd: projectPath,
          ignore: this.ignorePatterns,
          absolute: false
        });
        // Convert to absolute paths
        const absoluteFiles = files.map(f => path.join(projectPath, f));
        allFiles.push(...absoluteFiles);
      } catch (error) {
        console.error(`Error finding files with pattern ${pattern}:`, error.message);
      }
    }
    
    // Remove duplicates
    return [...new Set(allFiles)];
  }

  async checkCSSFiles(projectPath, usedDependencies) {
    try {
      const cssFiles = await glob(path.join(projectPath, '**/*.css'), {
        ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
      });
      
      for (const file of cssFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          
          // Check for Tailwind directives
          if (content.includes('@tailwind')) {
            if (!usedDependencies.has('tailwindcss')) {
              usedDependencies.set('tailwindcss', []);
            }
            usedDependencies.get('tailwindcss').push({
              file: path.relative(projectPath, file),
              line: 1,
              reason: 'CSS @tailwind directive'
            });
            
            // If Tailwind is used, autoprefixer and postcss are typically used too
            if (!usedDependencies.has('autoprefixer')) {
              usedDependencies.set('autoprefixer', []);
            }
            usedDependencies.get('autoprefixer').push({
              file: path.relative(projectPath, file),
              line: 1,
              reason: 'Used with Tailwind CSS'
            });
            
            if (!usedDependencies.has('postcss')) {
              usedDependencies.set('postcss', []);
            }
            usedDependencies.get('postcss').push({
              file: path.relative(projectPath, file),
              line: 1,
              reason: 'CSS processor for Tailwind'
            });
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    } catch (error) {
      // CSS check is optional
    }
  }

  async checkConfigFiles(projectPath, usedDependencies) {
    const configFiles = [
      { file: 'tailwind.config.js', packages: ['tailwindcss'] },
      { file: 'tailwind.config.ts', packages: ['tailwindcss'] },
      { file: 'postcss.config.js', packages: ['postcss', 'autoprefixer', 'tailwindcss'] },
      { file: 'postcss.config.ts', packages: ['postcss', 'autoprefixer', 'tailwindcss'] },
    ];
    
    for (const config of configFiles) {
      try {
        const configPath = path.join(projectPath, config.file);
        await fs.access(configPath);
        
        for (const pkg of config.packages) {
          if (!usedDependencies.has(pkg)) {
            usedDependencies.set(pkg, []);
          }
          usedDependencies.get(pkg).push({
            file: config.file,
            line: 1,
            reason: `Configuration file: ${config.file}`
          });
        }
      } catch (error) {
        // Config file doesn't exist, skip
      }
    }
  }

  async checkPackageScripts(projectPath, usedDependencies) {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);
      
      if (packageJson.scripts) {
        const scriptsContent = JSON.stringify(packageJson.scripts);
        
        // Check for react-scripts usage
        if (scriptsContent.includes('react-scripts')) {
          if (!usedDependencies.has('react-scripts')) {
            usedDependencies.set('react-scripts', []);
          }
          usedDependencies.get('react-scripts').push({
            file: 'package.json',
            line: 1,
            reason: 'Used in npm scripts'
          });
        }
        
        // Check for concurrently usage
        if (scriptsContent.includes('concurrently')) {
          if (!usedDependencies.has('concurrently')) {
            usedDependencies.set('concurrently', []);
          }
          usedDependencies.get('concurrently').push({
            file: 'package.json',
            line: 1,
            reason: 'Used in npm scripts'
          });
        }
        
        // Check for other build tools
        if (scriptsContent.includes('tailwindcss') || scriptsContent.includes('postcss')) {
          if (!usedDependencies.has('tailwindcss')) {
            usedDependencies.set('tailwindcss', []);
          }
          usedDependencies.get('tailwindcss').push({
            file: 'package.json',
            line: 1,
            reason: 'Used in npm scripts'
          });
        }
      }
    } catch (error) {
      // Couldn't read package.json, skip
    }
  }

  handleSpecialCases(usedDependencies) {
    // react-dom is required by react (peer dependency)
    if (usedDependencies.has('react') && !usedDependencies.has('react-dom')) {
      usedDependencies.set('react-dom', [{
        file: 'package.json',
        line: 1,
        reason: 'Peer dependency of react'
      }]);
    }
    
    // react-scripts typically requires react and react-dom
    if (usedDependencies.has('react-scripts')) {
      if (!usedDependencies.has('react')) {
        usedDependencies.set('react', [{
          file: 'package.json',
          line: 1,
          reason: 'Required by react-scripts'
        }]);
      }
      if (!usedDependencies.has('react-dom')) {
        usedDependencies.set('react-dom', [{
          file: 'package.json',
          line: 1,
          reason: 'Required by react-scripts'
        }]);
      }
    }
  }

  async extractImports(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const imports = [];
      
      // More comprehensive patterns for different import styles
      // Order matters: more specific patterns first
      const importPatterns = [
        // Pattern 1: import Default, { named } from 'package'
        // Matches: import React, { useState } from 'react';
        /^import\s+[\w\s,{}]+\s+from\s+['"]([^'"]+)['"]/,
        
        // Pattern 2: import { named1, named2 } from 'package'
        // Matches: import { Command } from 'commander';
        // Matches: import { BarChart, Bar } from 'recharts';
        /^import\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/,
        
        // Pattern 3: import Default from 'package'
        // Matches: import express from 'express';
        /^import\s+\w+\s+from\s+['"]([^'"]+)['"]/,
        
        // Pattern 4: import * as name from 'package'
        // Matches: import * as _ from 'lodash';
        /^import\s+\*\s+as\s+\w+\s+from\s+['"]([^'"]+)['"]/,
        
        // Pattern 5: Side-effect import
        // Matches: import 'package';
        /^import\s+['"]([^'"]+)['"]/,
        
        // Pattern 6: CommonJS require
        // Matches: const x = require('package');
        // Matches: require('package');
        /require\s*\(['"]([^'"]+)['"]\)/,
        
        // Pattern 7: Dynamic import
        // Matches: await import('package');
        // Matches: import('package');
        /import\s*\(['"]([^'"]+)['"]\)/,
      ];
      
      lines.forEach((line, index) => {
        // Skip comments and empty lines
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
          return;
        }
        
        for (const pattern of importPatterns) {
          const match = trimmedLine.match(pattern);
          if (match) {
            // Extract package path - it's in the last capture group
            let packagePath = match[match.length - 1];
            
            if (!packagePath) {
              continue;
            }
            
            // Skip relative imports (./ or ../)
            if (packagePath.startsWith('.') || packagePath.startsWith('/')) {
              continue;
            }
            
            // Skip Node.js built-in modules
            const builtInModules = [
              'path', 'fs', 'os', 'http', 'https', 'url', 'util', 'stream',
              'events', 'buffer', 'crypto', 'zlib', 'child_process', 'cluster',
              'dgram', 'dns', 'net', 'readline', 'repl', 'tls', 'vm', 'worker_threads',
              'assert', 'console', 'process', 'querystring', 'string_decoder', 'timers',
              'tty', 'v8', 'perf_hooks'
            ];
            const basePackageName = packagePath.split('/')[0];
            if (builtInModules.includes(basePackageName)) {
              continue;
            }
            
            // Extract package name from path
            // Handle scoped packages: @scope/package/subpath -> @scope/package
            // Handle regular packages: package/subpath -> package
            let packageName;
            if (packagePath.startsWith('@')) {
              // Scoped package: @scope/package/subpath -> @scope/package
              const parts = packagePath.split('/');
              if (parts.length >= 2) {
                packageName = `${parts[0]}/${parts[1]}`;
              } else {
                packageName = parts[0];
              }
            } else {
              // Regular package: package/subpath -> package
              packageName = packagePath.split('/')[0];
            }
            
            // Skip if empty
            if (!packageName) {
              continue;
            }
            
            imports.push({
              name: packageName,
              fullImport: trimmedLine,
              line: index + 1
            });
            break; // Found a match, move to next line
          }
        }
      });
      
      return imports;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
      return [];
    }
  }
}

export { NodeJSAnalyzer };

