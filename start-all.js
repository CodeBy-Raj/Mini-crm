const { spawn } = require('child_process');

const mode = process.argv[2] || 'dev';

console.log('[Runner] Initializing multi-process task orchestrator...');

// 1. Start Simulated Channel Express application
console.log('[Runner] Launching simulated communications channel-service on port 3001...');
const expressProcess = spawn('node', ['./channel-service/server.js'], {
  stdio: 'inherit',
  shell: true,
});

expressProcess.on('error', (err) => {
  console.error('[Runner] Express child process error:', err);
});

// 2. Start Next.js container (Port 3000)
console.log(`[Runner] Launching Next.js in ${mode} mode...`);
const nextArgs = mode === 'start' 
  ? ['start', '-p', '3000', '-H', '0.0.0.0'] 
  : ['dev', '-p', '3000', '-H', '0.0.0.0'];

const nextProcess = spawn('npx', ['next', ...nextArgs], {
  stdio: 'inherit',
  shell: true,
});

nextProcess.on('error', (err) => {
  console.error('[Runner] Next.js child process error:', err);
});

// 3. Process termination & teardown lifecycle management
let hasCleanedUp = false;
function shutdown(code = 0) {
  if (hasCleanedUp) return;
  hasCleanedUp = true;
  console.log('[Runner] Termination signal received. Killing all active background processes...');
  try {
    expressProcess.kill('SIGTERM');
  } catch (e) {
    // Ignore error
  }
  try {
    nextProcess.kill('SIGTERM');
  } catch (e) {
    // Ignore error
  }
  process.exit(code);
}

expressProcess.on('exit', (code) => {
  console.log(`[Runner] Express service exited with code ${code}. Cleaning up sibling processes...`);
  shutdown(code || 0);
});

nextProcess.on('exit', (code) => {
  console.log(`[Runner] Next.js service exited with code ${code}. Cleaning up sibling processes...`);
  shutdown(code || 0);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (err) => {
  console.error('[Runner] Unhandled Runner Exception:', err);
  shutdown(1);
});
