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

const autoRemovePackages = async (req, res) => {
  try {
    const { projectPath, unusedPackages } = req.body;

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
    const command = `npm uninstall ${unusedPackages.join(' ')}`;

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