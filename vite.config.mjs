// @ts-check
import { env } from 'node:process';
import { resolve, extname, join } from 'node:path';
import { readdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getInputHtmlFiles() {
    const srcDir = resolve(import.meta.dirname, 'src');
    return readdirSync(srcDir)
        .filter((file) => extname(file) === '.html')
        .map((file) => join(srcDir, file));
}

export default defineConfig({
    plugins: [react()],
    root: 'src',
    publicDir: resolve(import.meta.dirname, 'public'),
    build: {
        outDir: resolve(import.meta.dirname, 'static'),
        rollupOptions: {
            input: getInputHtmlFiles(),
        },
        emptyOutDir: true,
        sourcemap: true,
    },
    define: {
        BUILD_COMMIT_HASH: JSON.stringify(env.BUILD_COMMIT_HASH),
    },
    server: {
        proxy: {
            // Proxy API requests to staging backend
            '/proxy': {
                target: 'https://staging.api.clearsky.services',
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: '', // rewrite cookie domain to localhost
                rewrite: (path) => path.replace(/^\/proxy/, ''), // <--- strip /proxy
            },
        },
    },
});
