#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');
const fs = require('fs').promises;

console.log(chalk.blue.bold('\n🔍 Verifying Unused Package Detection System...\n'));

let passed = 0;
let failed = 0;

async function check(description, test) {
  try {
    const result = await test();
    if (result) {
      console.log(chalk.green('  ✅'), description);
      passed++;
    } else {
      console.log(chalk.red('  ❌'), description);
      failed++;
    }
  } catch (error) {
    console.log(chalk.red('  ❌'), description, '-', error.message);
    failed++;
  }
}

async function verifyProject() {
  console.log(chalk.cyan('📁 Checking Files and Directories...\n'));
  
  await check('package.json exists', async () => {
    await fs.access('package.json');
    return true;
  });
  
  await check('Backend server.js exists', async () => {
    await fs.access('backend/server.js');
    return true;
  });
  
  await check('CLI index.js exists', async () => {
    await fs.access('cli/index.js');
    return true;
  });
  
  await check('Frontend App.js exists', async () => {
    await fs.access('frontend/src/App.js');
    return true;
  });
  
  await check('Example project exists', async () => {
    await fs.access('example-project/package.json');
    return true;
  });
  
  console.log(chalk.cyan('\n📦 Checking Dependencies...\n'));
  
  await check('node_modules installed', async () => {
    await fs.access('node_modules');
    return true;
  });
  
  await check('Frontend node_modules installed', async () => {
    await fs.access('frontend/node_modules');
    return true;
  });
  
  console.log(chalk.cyan('\n⚙️  Checking Configuration...\n'));
  
  await check('.env file exists', async () => {
    await fs.access('.env');
    return true;
  });
  
  await check('env.example exists', async () => {
    await fs.access('env.example');
    return true;
  });
  
  console.log(chalk.cyan('\n🧪 Checking Tests...\n'));
  
  await check('Tests directory exists', async () => {
    await fs.access('tests/analyzer.test.js');
    return true;
  });
  
  await check('Jest config exists', async () => {
    await fs.access('jest.config.js');
    return true;
  });
  
  console.log(chalk.cyan('\n📚 Checking Documentation...\n'));
  
  const docs = ['README.md', 'START_HERE.md', 'QUICKSTART.md', 'USAGE.md', 'SETUP.md'];
  for (const doc of docs) {
    await check(`${doc} exists`, async () => {
      await fs.access(doc);
      return true;
    });
  }
  
  console.log(chalk.cyan('\n🔬 Testing Backend Server...\n'));
  
  await check('Backend can be required', async () => {
    // Just check if files can be loaded
    require('./backend/server.js');
    return true;
  });
  
  await check('Analyzer can be required', async () => {
    require('./backend/services/analyzer.js');
    return true;
  });
  
  await check('Parser can be required', async () => {
    require('./backend/parsers/nodejsParser.js');
    return true;
  });
  
  console.log(chalk.cyan('\n📊 Summary...\n'));
  
  console.log(chalk.green(`✅ Passed: ${passed}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  
  if (failed === 0) {
    console.log(chalk.bold.green('\n🎉 All checks passed! Project is ready to use!\n'));
    console.log(chalk.yellow('Next steps:'));
    console.log('  1. npm start');
    console.log('  2. npm run cli scan example-project');
    console.log('  3. npm run frontend\n');
    return 0;
  } else {
    console.log(chalk.bold.red('\n⚠️  Some checks failed. Please review the errors above.\n'));
    return 1;
  }
}

verifyProject().then(code => process.exit(code));

