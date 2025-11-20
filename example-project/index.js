// Example project to demonstrate unused package detection
const express = require('express');
const chalk = require('chalk');

const app = express();

app.get('/', (req, res) => {
  console.log(chalk.blue('Hello from the example project!'));
  res.json({ message: 'Welcome to the example project' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

