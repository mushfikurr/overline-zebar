import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const ReactCompilerConfig = {
  target: '18',
};

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
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

        // Start the new zebar.exe process
        execSync(`start ${exePath}`, { stdio: 'inherit' });
      },
    },
  ],
  base: './',
});
