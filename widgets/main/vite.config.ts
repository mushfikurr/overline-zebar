import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync, spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();
const ReactCompilerConfig = {
  target: '18',
};

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    {
      name: 'postbuild',
      closeBundle() {
        if (process.env.CI) {
          console.log('Skipping zebar.exe task because this is a CI build');
          return;
        }

        const exePath = process.env.ZEBAR_EXE_PATH || 'zebar.exe';

        try {
          // Kill the existing zebar.exe process
          execSync(`taskkill /IM ${exePath} /F`, { stdio: 'inherit' });
        } catch (err) {
          console.log(err.message);
        }

        // Start the new zebar.exe process detached, so the build never
        // waits on it (execSync('start ...') hangs on inherited handles).
        spawn('cmd', ['/c', 'start', '', exePath], {
          detached: true,
          stdio: 'ignore',
        }).unref();
      },
    },
  ],
  base: './',
});
