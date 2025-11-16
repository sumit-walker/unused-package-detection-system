import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execPromise = promisify(exec);

class OutdatedChecker {
  constructor(language) {
    this.language = language;
  }

  async check(projectPath, dependencies, language) {
    switch (language) {
      case 'nodejs':
        return await this.checkNodeJS(projectPath, dependencies);
      case 'python':
        return await this.checkPython(projectPath, dependencies);
      case 'java':
        return await this.checkJava(projectPath, dependencies);
      default:
        return [];
    }
  }

  async checkNodeJS(projectPath, dependencies) {
    try {
      // Run npm outdated to get packages with newer versions
      const { stdout } = await execPromise('npm outdated --json', {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024
      });

      const outdatedData = JSON.parse(stdout);
      const outdated = [];

      // npm outdated returns an object with package names as keys
      for (const packageName of Object.keys(outdatedData)) {
        const info = outdatedData[packageName];
        outdated.push({
          package: packageName,
          current: info.current || 'unknown',
          wanted: info.wanted || info.current,
          latest: info.latest || info.wanted || info.current,
          location: info.location || 'dependency',
          type: await this.getPackageType(packageName, projectPath)
        });
      }

      return outdated;
    } catch (error) {
      // npm outdated exits with code 1 when packages are outdated
      // This is expected behavior, so we parse the output
      if (error.stdout) {
        try {
          const outdatedData = JSON.parse(error.stdout);
          const outdated = [];

          for (const packageName of Object.keys(outdatedData)) {
            const info = outdatedData[packageName];
            outdated.push({
              package: packageName,
              current: info.current || 'unknown',
              wanted: info.wanted || info.current,
              latest: info.latest || info.wanted || info.current,
              location: info.location || 'dependency',
              type: await this.getPackageType(packageName, projectPath)
            });
          }

          return outdated;
        } catch (e) {
          // If parsing fails, return empty array
          return [];
        }
      }
      return [];
    }
  }

  async checkPython(projectPath, dependencies) {
    try {
      // Use pip list --outdated to check for outdated packages
      const { stdout } = await execPromise('pip list --outdated --format json', {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024
      });

      const outdatedData = JSON.parse(stdout);
      const outdated = [];

      outdatedData.forEach(pkg => {
        outdated.push({
          package: pkg.name,
          current: pkg.version || 'unknown',
          latest: pkg.latest_version || pkg.version,
          wanted: pkg.latest_version || pkg.version,
          location: 'dependency',
          type: 'dependency'
        });
      });

      return outdated;
    } catch (error) {
      // pip list --outdated may fail if no packages are outdated
      return [];
    }
  }

  async checkJava(projectPath, dependencies) {
    // For Java, we'd need to check Maven Central or Gradle repositories
    // This is more complex and would require API calls
    // For now, return empty array
    // TODO: Implement Maven/Gradle version checking
    return [];
  }

  async getPackageType(packageName, projectPath) {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);
      
      if (packageJson.dependencies && packageJson.dependencies[packageName]) {
        return 'dependency';
      }
      if (packageJson.devDependencies && packageJson.devDependencies[packageName]) {
        return 'devDependency';
      }
      return 'unknown';
    } catch (error) {
      return 'dependency';
    }
  }

  getOutdatedSeverity(current, latest) {
    // Simple heuristic: major version difference = major update
    // minor version difference = minor update
    // patch version difference = patch update
    try {
      const currentParts = current.split('.').map(Number);
      const latestParts = latest.split('.').map(Number);

      if (currentParts[0] < latestParts[0]) {
        return 'major'; // Major version update
      } else if (currentParts[1] < latestParts[1]) {
        return 'minor'; // Minor version update
      } else if (currentParts[2] < latestParts[2]) {
        return 'patch'; // Patch update
      }
      return 'none';
    } catch (error) {
      return 'unknown';
    }
  }
}

export { OutdatedChecker };

