import { exec } from 'child_process';
import { promisify } from 'util';
import inquirer from 'inquirer';
import chalk from 'chalk';

const execPromise = promisify(exec);

async function autoRemove(results, language = 'nodejs') {
  const unusedPackages = results.dependencies.unused.map(dep => dep.name);
  
  console.log(chalk.blue('\n🗑️  Removing unused packages...\n'));

  try {
    let command;
    
    if (language === 'nodejs') {
      const { packageManager } = await inquirer.prompt([
        {
          type: 'list',
          name: 'packageManager',
          message: 'Select package manager:',
          choices: ['npm', 'yarn', 'pnpm']
        }
      ]);

      switch (packageManager) {
        case 'npm':
          command = `npm uninstall ${unusedPackages.join(' ')}`;
          break;
        case 'yarn':
          command = `yarn remove ${unusedPackages.join(' ')}`;
          break;
        case 'pnpm':
          command = `pnpm remove ${unusedPackages.join(' ')}`;
          break;
      }
    } else if (language === 'python') {
      command = `pip uninstall -y ${unusedPackages.join(' ')}`;
      console.log(chalk.yellow('Note: You may need to manually update requirements.txt after removal.'));
    } else if (language === 'java') {
      console.log(chalk.yellow('\n⚠️  Java dependency removal requires manual editing of pom.xml or build.gradle'));
      console.log(chalk.yellow('Please remove the following dependencies manually:\n'));
      unusedPackages.forEach(pkg => {
        console.log(chalk.gray(`  • ${pkg}`));
      });
      return;
    }

    if (command) {
      console.log(chalk.gray(`Running: ${command}\n`));
      
      const { stdout, stderr } = await execPromise(command, {
        cwd: results.projectPath
      });

      if (stdout) console.log(chalk.green(stdout));
      if (stderr) console.log(chalk.yellow(stderr));

      console.log(chalk.green(`\n✅ Successfully removed ${unusedPackages.length} unused packages!\n`));
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error removing packages: ${error.message}\n`));
    throw error;
  }
}

export { autoRemove };