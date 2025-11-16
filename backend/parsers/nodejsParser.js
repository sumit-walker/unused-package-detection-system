import fs from 'fs/promises';
import path from 'path';

class NodeJSParser {
  async parse(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    try {
      const data = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(data);
      
      const dependencies = [];
      
      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(name => {
          dependencies.push({
            name,
            version: packageJson.dependencies[name],
            type: 'dependency',
            source: 'package.json'
          });
        });
      }
      
      if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach(name => {
          dependencies.push({
            name,
            version: packageJson.devDependencies[name],
            type: 'devDependency',
            source: 'package.json'
          });
        });
      }
      
      return dependencies;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`package.json not found in ${projectPath}`);
      }
      throw error;
    }
  }
}

export { NodeJSParser };