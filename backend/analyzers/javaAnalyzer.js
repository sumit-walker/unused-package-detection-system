import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

class JavaAnalyzer {
  constructor() {
    this.ignorePatterns = [
      '**/node_modules/**',
      '**/.git/**',
      '**/target/**',
      '**/build/**',
      '**/.gradle/**',
      '**/.m2/**'
    ];
  }

  async analyze(projectPath) {
    const files = await this.findSourceFiles(projectPath);
    const usedDependencies = new Map();
    
    for (const file of files) {
      const imports = await this.extractImports(file);
      imports.forEach(imp => {
        // Convert Java package to Maven/Gradle dependency format
        const dependencyName = this.mapPackageToDependency(imp.package);
        if (dependencyName) {
          if (!usedDependencies.has(dependencyName)) {
            usedDependencies.set(dependencyName, []);
          }
          usedDependencies.get(dependencyName).push({
            file: path.relative(projectPath, file),
            line: imp.line
          });
        }
      });
    }
    
    return Array.from(usedDependencies.entries()).map(([name, locations]) => ({
      name,
      locations
    }));
  }

  async findSourceFiles(projectPath) {
    const patterns = ['**/*.java'];
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
      
      // Pattern for Java imports: import package.Class; or import package.*;
      const importPattern = /^import\s+(?:static\s+)?([a-zA-Z0-9_.]+)\s*;/;
      
      lines.forEach((line, index) => {
        const match = line.match(importPattern);
        if (match) {
          const fullPackage = match[1];
          imports.push({
            package: fullPackage,
            fullImport: match[0],
            line: index + 1
          });
        }
      });
      
      return imports;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
      return [];
    }
  }

  // Map Java package to Maven/Gradle dependency format
  // This is a simplified mapping - in reality, you'd need a more sophisticated approach
  mapPackageToDependency(javaPackage) {
    // Common mappings for popular libraries
    const commonMappings = {
      'org.springframework': 'org.springframework:spring-core',
      'org.apache.commons': 'org.apache.commons:commons-lang3',
      'com.google.guava': 'com.google.guava:guava',
      'org.slf4j': 'org.slf4j:slf4j-api',
      'ch.qos.logback': 'ch.qos.logback:logback-classic',
      'junit': 'junit:junit',
      'org.junit': 'org.junit.jupiter:junit-jupiter',
      'org.mockito': 'org.mockito:mockito-core',
      'com.fasterxml.jackson': 'com.fasterxml.jackson.core:jackson-databind',
      'javax.servlet': 'javax.servlet:javax.servlet-api',
      'org.hibernate': 'org.hibernate:hibernate-core',
      'org.apache.logging.log4j': 'org.apache.logging.log4j:log4j-core'
    };
    
    // Check for exact matches first
    for (const [pkg, dep] of Object.entries(commonMappings)) {
      if (javaPackage.startsWith(pkg)) {
        return dep;
      }
    }
    
    // Try to infer from package structure: com.company.product -> com.company:product
    const parts = javaPackage.split('.');
    if (parts.length >= 2) {
      // Take first two parts as groupId:artifactId
      const groupId = parts[0];
      const artifactId = parts[1];
      return `${groupId}:${artifactId}`;
    }
    
    return null;
  }
}

export { JavaAnalyzer };