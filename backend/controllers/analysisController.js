import { ProjectAnalyzer } from '../services/analyzer.js';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const analyzeProject = async (req, res) => {
  try {
    const { projectPath, language } = req.body;

    if (!projectPath) {
      return res.status(400).json({ error: 'Project path is required' });
    }

    const analyzer = new ProjectAnalyzer(language || null);
    const results = await analyzer.analyze(projectPath);

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const NODE_MANAGERS = new Set(['npm', 'yarn', 'pnpm']);

const autoRemovePackages = async (req, res) => {
  try {
    const { projectPath, unusedPackages, packageManager: pmRaw, language: langRaw } = req.body;
    const language = String(langRaw || 'nodejs').toLowerCase();

    if (!projectPath || !unusedPackages || !Array.isArray(unusedPackages)) {
      return res.status(400).json({ 
        success: false,
        error: 'Project path and unusedPackages array are required' 
      });
    }

    if (unusedPackages.length === 0) {
      return res.json({
        success: true,
        message: 'No packages to remove',
        packagesRemoved: 0
      });
    }

    const resolvedPath = path.resolve(projectPath);
    let command;

    if (language === 'nodejs') {
      const pm = String(pmRaw || 'npm').toLowerCase();
      if (!NODE_MANAGERS.has(pm)) {
        return res.status(400).json({
          success: false,
          error: 'packageManager must be one of: npm, yarn, pnpm',
        });
      }
      if (pm === 'npm') command = `npm uninstall ${unusedPackages.join(' ')}`;
      else if (pm === 'yarn') command = `yarn remove ${unusedPackages.join(' ')}`;
      else command = `pnpm remove ${unusedPackages.join(' ')}`;
    } else if (language === 'python') {
      command = `pip uninstall -y ${unusedPackages.join(' ')}`;
    } else if (language === 'java') {
      return res.status(400).json({
        success: false,
        error: 'Automatic removal is not supported for Java; edit pom.xml or build.gradle manually.',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`,
      });
    }

    console.log(`Running: ${command} in ${resolvedPath}`);

    const { stdout, stderr } = await execPromise(command, {
      cwd: resolvedPath,
      maxBuffer: 10 * 1024 * 1024
    });

    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);

    res.json({
      success: true,
      message: `Successfully removed ${unusedPackages.length} unused packages`,
      packagesRemoved: unusedPackages.length
    });
  } catch (error) {
    console.error('Auto-remove error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export { analyzeProject, autoRemovePackages };