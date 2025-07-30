#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const environment = args[0] || 'development';

console.log(`Configuring environment for: ${environment}`);

// Read the appropriate environment file
const envFile = path.join(__dirname, `env.${environment}`);
const targetFile = path.join(__dirname, '.env');

if (!fs.existsSync(envFile)) {
  console.error(`Environment file ${envFile} not found!`);
  console.log('Available environments:');
  fs.readdirSync(__dirname)
    .filter(file => file.startsWith('env.'))
    .forEach(file => console.log(`  - ${file.replace('env.', '')}`));
  process.exit(1);
}

// Copy the environment file to .env
fs.copyFileSync(envFile, targetFile);
console.log(`✅ Environment configured for ${environment}`);
console.log(`📁 Created .env from ${envFile}`);

// Display the current configuration
const envContent = fs.readFileSync(targetFile, 'utf8');
console.log('\n📋 Current configuration:');
console.log(envContent);

if (environment === 'production') {
  console.log('\n⚠️  IMPORTANT: Make sure to update the VITE_API_BASE_URL in .env with your actual Render app URL!');
  console.log('   Example: https://refuture-backend-1.onrender.com/api');
} 