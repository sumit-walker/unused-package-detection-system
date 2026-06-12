#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { ProjectAnalyzer } from '../backend/services/analyzer.js';
import { autoRemove } from './autoRemove.js';

const program = new Command();

program
  .name('unused-packages')
  .description('Detect and remove unused dependencies across multiple languages')
  .version('2.0.0');

program
  .command('scan')
  .description('Scan a project for unused dependencies')
  .argument('[path]', 'Project path to analyze (defaults to current directory)', process.cwd())
  .option('-l, --language <lang>', 'Project language (nodejs, python, java). Auto-detected if not specified')
  .option('-j, --json', 'Output results as JSON')
  .option('-r, --remove-unused', 'Remove unused packages automatically')
  .option('--pm <manager>', 'With --remove-unused: npm, yarn, or pnpm (skips prompt)')
  .option('-o, --open-dashboard', 'Open results in web dashboard')
  .action(async (projectPath, options) => {
    try {
      const fullPath = path.resolve(projectPath);
      
      console.log(chalk.blue('\n🔍 Scanning project for unused dependencies...\n'));
      console.log(chalk.gray(`📁 Project path: ${fullPath}\n`));
      
      const analyzer = new ProjectAnalyzer(options.language || null);
      const results = await analyzer.analyze(fullPath);

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        printResults(results);
      }

      if (options.removeUnused) {
        if (String(process.env.CI || '').toLowerCase() === 'true') {
          console.error(
            chalk.red(
              '\nCI detected: `scan --remove-unused` needs a TTY for prompts. Use instead:\n  node cli/index.js remove -y --pm npm <project-path>\n',
            ),
          );
          process.exit(1);
        }
        await handleAutoRemove(results, { packageManager: options.pm });
      }

      if (options.openDashboard) {
        await openDashboard(results);
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

program
  .command('remove')
  .description('Scan the project and uninstall unused dependencies (use --yes for no prompts)')
  .argument('[path]', 'Project path (defaults to current directory)', process.cwd())
  .option('-l, --language <lang>', 'Project language (nodejs, python, java). Auto-detected if omitted')
  .option('-y, --yes', 'Skip confirmation (Node.js: uses npm unless --pm is set)')
  .option('--pm <manager>', 'Package manager for Node.js: npm, yarn, or pnpm')
  .option('-j, --json', 'Print a short JSON summary after removal')
  .action(async (projectPath, options) => {
    try {
      if (String(process.env.CI || '').toLowerCase() === 'true' && !options.yes) {
        console.error(
          chalk.red(
            '\nCI is non-interactive: pass --yes and --pm (for Node). Example:\n  node cli/index.js remove -y --pm npm .\n',
          ),
        );
        process.exit(1);
      }

      const fullPath = path.resolve(projectPath);
      console.log(chalk.blue('\n🔍 Finding unused dependencies...\n'));
      console.log(chalk.gray(`📁 ${fullPath}\n`));

      const analyzer = new ProjectAnalyzer(options.language || null);
      const results = await analyzer.analyze(fullPath);

      if (results.dependencies.unused.length === 0) {
        console.log(chalk.green('✅ No unused packages to remove.\n'));
        if (options.json) {
          console.log(JSON.stringify({ removed: 0, packages: [], projectPath: fullPath }, null, 2));
        }
        return;
      }

      const names = results.dependencies.unused.map((d) => d.name);

      if (!options.yes) {
        printResults(results);
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow(`Remove ${names.length} unused package(s)?`),
            default: false,
          },
        ]);
        if (!confirm) {
          console.log(chalk.blue('\n❌ Removal cancelled.\n'));
          return;
        }
      } else {
        console.log(
          chalk.yellow(
            `Removing ${names.length} unused package(s): ${chalk.white(names.join(', '))}\n`,
          ),
        );
      }

      const pm =
        options.pm ||
        (options.yes && results.language === 'nodejs' ? 'npm' : undefined);

      await autoRemove(results, results.language, { packageManager: pm });

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              removed: names.length,
              packages: names,
              projectPath: fullPath,
              language: results.language,
            },
            null,
            2,
          ),
        );
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

function printResults(results) {
  console.log(chalk.bold('\n📊 Analysis Results\n'));
  console.log(chalk.cyan('━'.repeat(60)));
  
  console.log(chalk.bold(`\nLanguage: ${chalk.blue(results.language.toUpperCase())}`));
  console.log(chalk.bold(`Project: ${chalk.gray(results.projectPath)}\n`));
  
  // Summary
  console.log(chalk.bold('Summary:'));
  console.log(`  Total Dependencies: ${results.summary.totalDependencies}`);
  console.log(chalk.green(`  ✅ Used: ${results.summary.usedCount}`));
  console.log(chalk.red(`  ❌ Unused: ${results.summary.unusedCount}`));
  console.log(chalk.yellow(`  ⚠️  Missing: ${results.summary.missingCount}`));
  console.log(chalk.magenta(`  🔒 Vulnerabilities: ${results.summary.vulnerabilityCount}`));
  console.log(chalk.blue(`  📦 Outdated: ${results.summary.outdatedCount || 0}`));

  // Unused packages
  if (results.dependencies.unused.length > 0) {
    console.log(chalk.bold('\n❌ Unused Packages:'));
    results.dependencies.unused.forEach(dep => {
      console.log(chalk.gray(`  • ${dep.name} (${dep.version})`));
    });
  }

  // Missing packages
  if (results.dependencies.missing.length > 0) {
    const depFile = results.language === 'nodejs' ? 'package.json' : 
                    results.language === 'python' ? 'requirements.txt' : 
                    'pom.xml or build.gradle';
    console.log(chalk.bold(`\n⚠️  Missing from ${depFile} (used but not declared):`));
    results.dependencies.missing.forEach(dep => {
      console.log(chalk.yellow(`  • ${dep.name}`));
    });
  }

  // Vulnerabilities
  if (results.security.vulnerabilities.length > 0) {
    console.log(chalk.bold('\n🔒 Security Vulnerabilities:'));
    results.security.vulnerabilities.slice(0, 10).forEach(vuln => {
      const severityColor = getSeverityColor(vuln.severity);
      console.log(chalk[severityColor](`  [${vuln.severity.toUpperCase()}] ${vuln.package}`));
    });
    if (results.security.vulnerabilities.length > 10) {
      console.log(chalk.gray(`  ... and ${results.security.vulnerabilities.length - 10} more`));
    }
  }

  // Outdated packages
  if (results.outdated && results.outdated.length > 0) {
    console.log(chalk.bold('\n📦 Outdated Packages (newer versions available):'));
    results.outdated.slice(0, 10).forEach(pkg => {
      console.log(chalk.blue(`  • ${pkg.package}: ${chalk.gray(pkg.current)} → ${chalk.green(pkg.latest)}`));
    });
    if (results.outdated.length > 10) {
      console.log(chalk.gray(`  ... and ${results.outdated.length - 10} more`));
    }
  }

  // Storage impact
  if (results.dependencies.unused.length > 0) {
    console.log(chalk.bold('\n💾 Storage Impact:'));
    console.log(`  Estimated Savings: ${chalk.green(results.impact.storageSavedMB)} MB (${results.impact.storageSavedGB} GB)`);
    console.log(`  Packages to Remove: ${results.impact.packagesToRemove}`);
  }

  console.log(chalk.cyan('\n━'.repeat(60)));
}

function getSeverityColor(severity) {
  const colors = {
    'critical': 'red',
    'high': 'magenta',
    'moderate': 'yellow',
    'low': 'blue'
  };
  return colors[severity.toLowerCase()] || 'gray';
}

/** @param {object} results Analyzer output @param {{ packageManager?: string }} [opts] */
async function handleAutoRemove(results, opts = {}) {
  if (results.dependencies.unused.length === 0) {
    console.log(chalk.green('\n✅ No unused packages to remove!\n'));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow(`Remove ${results.dependencies.unused.length} unused packages?`),
      default: false,
    },
  ]);

  if (confirm) {
    await autoRemove(results, results.language, { packageManager: opts.packageManager });
  } else {
    console.log(chalk.blue('\n❌ Removal cancelled.\n'));
  }
}

async function openDashboard(results) {
  try {
    const { default: open } = await import('open');
    const dashboardUrl = 'http://localhost:3000';
    
    console.log(chalk.blue(`\n🌐 Opening dashboard at ${dashboardUrl}...\n`));
    console.log(chalk.yellow('Note: Make sure the frontend server is running (npm run frontend)\n'));
    
    await open(dashboardUrl);
  } catch (error) {
    console.log(chalk.yellow(`Could not open browser automatically. Please visit: http://localhost:3000`));
  }
}

program.parse();

export { program };

