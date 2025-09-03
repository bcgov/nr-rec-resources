import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'shared',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@nestjs/common',
        '@nestjs/config',
        '@nestjs/core',
        '@nestjs/swagger',
        '@aws-sdk/client-cloudwatch',
        'nestjs-cls',
        'rxjs',
        'express',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    root: path.resolve(__dirname),
    alias: {
      '@shared': path.resolve(__dirname, './src'),
    },
  },
});
