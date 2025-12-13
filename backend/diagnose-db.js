#!/usr/bin/env node

/**
 * Database Diagnostic Script
 * 
 * This script helps diagnose login issues by checking:
 * - Database connectivity
 * - Schema integrity
 * - Default user existence
 * - Password validation
 * - Environment configuration
 * 
 * Usage: node diagnose-db.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Database Diagnostic for Login Issues...\n');

try {
  // Compile TypeScript and run diagnostic
  const diagnosticPath = path.join(__dirname, 'src/utils/database-diagnostic.ts');
  
  console.log('📦 Compiling TypeScript...');
  execSync('npx ts-node ' + diagnosticPath, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
} catch (error) {
  console.error('❌ Failed to run diagnostic:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Make sure you are in the backend directory');
  console.log('2. Install dependencies: npm install');
  console.log('3. Check your .env file exists and has correct database settings');
  console.log('4. Ensure PostgreSQL is running');
  
  process.exit(1);
}