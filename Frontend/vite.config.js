import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Enforce strict Linux-compatible case sensitivity during Windows builds
function caseSensitiveChecker() {
  return {
    name: 'case-sensitive-checker',
    enforce: 'pre',
    resolveId(source, importer) {
      if (importer && source.startsWith('.')) {
        // Strip query strings or hashes
        const cleanSource = source.split('?')[0].split('#')[0];
        const dir = path.dirname(importer);
        const targetPath = path.resolve(dir, cleanSource);
        const targetDir = path.dirname(targetPath);
        const targetBase = path.basename(targetPath);

        if (fs.existsSync(targetDir)) {
          const files = fs.readdirSync(targetDir);
          const exact = files.find(f => f === targetBase || f.replace(/\.[^/.]+$/, '') === targetBase);
          const caseInsensitive = files.find(
            f => f.toLowerCase() === targetBase.toLowerCase() || f.replace(/\.[^/.]+$/, '').toLowerCase() === targetBase.toLowerCase()
          );

          if (caseInsensitive && !exact) {
            this.error(
              `[LINUX CASE-SENSITIVITY MISMATCH] in "${importer}":\nImported: "${source}"\nActual on disk: "${caseInsensitive}"\nThis will fail on Linux/Vercel production environments!`
            );
          }
        }
      }
      return null;
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [caseSensitiveChecker(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
