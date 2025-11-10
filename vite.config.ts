import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            '@primary-color': '#1890ff',
            '@success-color': '#52c41a',
            '@warning-color': '#faad14',
            '@error-color': '#ff4d4f',
            '@heading-color': '#000000',
            '@text-color': '#000000',
            '@text-color-secondary': '#666666',
          },
        },
      },
    },
    server: {
      port: 3008,
      host: '0.0.0.0',
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => {
            // 避免出现 /api/api 的重复前缀，仅在出现重复时裁剪
            const newPath = path.replace(/^\/api\/api/, '/api');
            console.log(`代理请求: ${path} -> ${env.VITE_API_URL || 'http://localhost:8000'}${newPath}`);
            return newPath;
          },
        },
      },
    },
  };
});

