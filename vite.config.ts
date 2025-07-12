import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env': Object.entries(env).reduce((prev, [key, val]) => {
        prev[key] = JSON.stringify(val);
        return prev;
      }, {})
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd())
      }
    }
  };
});
