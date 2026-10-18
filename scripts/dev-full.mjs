import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiUrl = 'http://127.0.0.1:3001/api/auth/me';

async function hasRunningKisanPulseApi() {
  try {
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(1000) });
    if (!response.ok) return false;
    const payload = await response.json();
    return Object.hasOwn(payload, 'user');
  } catch {
    return false;
  }
}

const children = [];
if (await hasRunningKisanPulseApi()) {
  console.log('Using the existing KisanPulse API at http://localhost:3001');
} else {
  children.push(spawn(process.execPath, [resolve(projectRoot, 'server/index.mjs')], {
    cwd: projectRoot,
    stdio: 'inherit',
    windowsHide: true
  }));
}

children.push(spawn(process.execPath, [resolve(projectRoot, 'node_modules/vite/bin/vite.js')], {
  cwd: projectRoot,
  stdio: 'inherit',
  windowsHide: true
}));

let stopping = false;
const stop = (signal = 'SIGTERM') => {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill(signal);
  }
};

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));

for (const child of children) {
  child.once('error', (error) => {
    console.error(`Could not start ${child.spawnargs[1]}: ${error.message}`);
    stop();
    process.exitCode = 1;
  });
  child.once('exit', (code, signal) => {
    if (!stopping && (code !== 0 || signal)) {
      console.error(`A development server stopped (code ${code ?? 'none'}, signal ${signal ?? 'none'}).`);
      stop();
      process.exitCode = code || 1;
    }
  });
}
