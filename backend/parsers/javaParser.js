import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import xml2js from 'xml2js';

const parseString = promisify(xml2js.parseString);

class JavaParser {
  async parse(projectPath) {
    const dependencies = [];
    
    // Try pom.xml (Maven)
    const pomPath = path.join(projectPath, 'pom.xml');
    try {
      const data = await fs.readFile(pomPath, 'utf8');
      const result = await parseString(data);
      
      const project = result.project || {};
      const deps = project.dependencies?.[0]?.dependency || [];
      
      deps.forEach(dep => {
        const groupId = dep.groupId?.[0] || '';
        const artifactId = dep.artifactId?.[0] || '';
        const version = dep.version?.[0] || 'unknown';
        
        if (groupId && artifactId) {
          // Use groupId:artifactId as the package identifier
          dependencies.push({
            name: `${groupId}:${artifactId}`,
            version: version,
            type: 'dependency',
            source: 'pom.xml',
            groupId,
            artifactId
          });
        }
      });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    // Try build.gradle or build.gradle.kts (Gradle)
    const gradlePaths = [
      path.join(projectPath, 'build.gradle'),
      path.join(projectPath, 'build.gradle.kts')
    ];
    
    for (const gradlePath of gradlePaths) {
      try {
        const data = await fs.readFile(gradlePath, 'utf8');
        // Simple regex parsing for Gradle dependencies
        // Format: implementation 'group:artifact:version' or implementation("group:artifact:version")
        const depPattern = /(?:implementation|compile|api|runtimeOnly)\s*[\(:]?\s*['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = depPattern.exec(data)) !== null) {
          const depString = match[1];
          const parts = depString.split(':');
          if (parts.length >= 2) {
            const groupId = parts[0];
            const artifactId = parts[1];
            const version = parts[2] || 'unknown';
            
            dependencies.push({
              name: `${groupId}:${artifactId}`,
              version: version,
              type: 'dependency',
              source: path.basename(gradlePath),
              groupId,
              artifactId
            });
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    
    if (dependencies.length === 0) {
      throw new Error('No Java dependencies found. Check for pom.xml or build.gradle');
    }
    
    return dependencies;
  }
}

export { JavaParser };