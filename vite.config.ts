import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                { src: 'manifest.json', dest: '' },
                { src: 'src/assets/*', dest: 'assets' },  // Иконки, svg, mp3
                { src: 'src/sounds/*', dest: 'sounds' },  // Аудио
            ]
        })
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                newtab: 'index.html',  // Главный entry
                background: 'src/background.js'  // Если background в src
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        }
    },
    resolve: {
        alias: {
            '@': '/src'  // Если используешь aliases
        }
    }
});