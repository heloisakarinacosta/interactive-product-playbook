
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if ts-node is installed
exec('npx ts-node --version', (error) => {
  if (error) {
    console.log('Installing ts-node...');
    exec('npm install -g ts-node typescript', (err) => {
      if (err) {
        console.error('Failed to install ts-node:', err);
        process.exit(1);
      }
      runSetup();
    });
  } else {
    runSetup();
  }
});

function runSetup() {
  console.log('Running database setup script...');
  exec('npx ts-node src/scripts/setupDatabase.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`Database setup failed: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
    console.log('Database setup completed successfully!');
  });
}
