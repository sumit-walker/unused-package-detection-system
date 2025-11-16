import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

class PythonAnalyzer {
  constructor() {
    this.ignorePatterns = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/__pycache__/**',
      '**/*.pyc',
      '**/venv/**',
      '**/env/**',
      '**/.venv/**'
    ];
  }

  async analyze(projectPath) {
    const files = await this.findSourceFiles(projectPath);
    const usedDependencies = new Map();
    
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
    
    return Array.from(usedDependencies.entries()).map(([name, locations]) => ({
      name,
      locations
    }));
  }

  async findSourceFiles(projectPath) {
    const patterns = ['**/*.py'];
    const allFiles = [];
    
    for (const pattern of patterns) {
      const files = await glob(path.join(projectPath, pattern), {
        ignore: this.ignorePatterns
      });
      allFiles.push(...files);
    }
    
    return allFiles;
  }

  async extractImports(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const imports = [];
      
      // Patterns for Python imports
      const patterns = [
        /^import\s+([a-zA-Z0-9_]+)/,  // import package
        /^from\s+([a-zA-Z0-9_.]+)\s+import/,  // from package import
      ];
      
      lines.forEach((line, index) => {
        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match) {
            let packageName = match[1];
            // Extract root package name (e.g., 'numpy.random' -> 'numpy')
            packageName = packageName.split('.')[0];
            
            imports.push({
              name: packageName,
              fullImport: match[0],
              line: index + 1
            });
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

export { PythonAnalyzer };