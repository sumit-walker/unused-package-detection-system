import fs from 'fs/promises';
import path from 'path';

class PythonParser {
  async parse(projectPath) {
    const dependencies = [];
    
    // Try requirements.txt first
    const requirementsPath = path.join(projectPath, 'requirements.txt');
    try {
      const data = await fs.readFile(requirementsPath, 'utf8');
      const lines = data.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        // Parse package name and version
        // Format: package==version or package>=version, etc.
        const match = trimmed.match(/^([a-zA-Z0-9_-]+[a-zA-Z0-9._-]*)(?:[=<>!]+(.+))?/);
        if (match) {
          dependencies.push({
            name: match[1],
            version: match[2] || 'unknown',
            type: 'dependency',
            source: 'requirements.txt'
          });
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    // Try setup.py
    const setupPath = path.join(projectPath, 'setup.py');
    try {
      const data = await fs.readFile(setupPath, 'utf8');
      // Simple regex to extract install_requires
      const installRequiresMatch = data.match(/install_requires\s*=\s*\[([^\]]+)\]/s);
      if (installRequiresMatch) {
        const deps = installRequiresMatch[1].split(',').map(d => d.trim().replace(/['"]/g, ''));
        deps.forEach(dep => {
          const match = dep.match(/^([a-zA-Z0-9_-]+)/);
          if (match) {
            dependencies.push({
              name: match[1],
              version: 'unknown',
              type: 'dependency',
              source: 'setup.py'
            });
          }
        });
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    // Try pyproject.toml
    const pyprojectPath = path.join(projectPath, 'pyproject.toml');
    try {
      const data = await fs.readFile(pyprojectPath, 'utf8');
      // Simple parsing for dependencies in [project] or [tool.poetry.dependencies]
      const projectDepsMatch = data.match(/\[project\]\s+dependencies\s*=\s*\[([^\]]+)\]/s);
      if (projectDepsMatch) {
        const deps = projectDepsMatch[1].split(',').map(d => d.trim().replace(/['"]/g, ''));
        deps.forEach(dep => {
          const match = dep.match(/^([a-zA-Z0-9_-]+)/);
          if (match) {
            dependencies.push({
              name: match[1],
              version: 'unknown',
              type: 'dependency',
              source: 'pyproject.toml'
            });
          }
        });
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    if (dependencies.length === 0) {
      throw new Error('No Python dependencies found. Check for requirements.txt, setup.py, or pyproject.toml');
    }
    
    return dependencies;
  }
}

export { PythonParser };