import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^es-toolkit\/compat\/(.*)$/,
        replacement: path.resolve(__dirname, 'src/compat/es-toolkit/$1'),
      },
    ],
  },
});
