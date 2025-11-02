import { defineConfig } from 'vite';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
  build: { sourcemap: true },
  define: {
    'import.meta.env.VITE_PIZZA_SERVICE_URL': JSON.stringify(process.env.VITE_PIZZA_SERVICE_URL || 'https://pizza-service.doddlebopper.click'),
    'import.meta.env.VITE_PIZZA_FACTORY_URL': JSON.stringify(process.env.VITE_PIZZA_FACTORY_URL || 'https://pizza-service.doddlebopper.click'),
  },
  plugins: [
    istanbul({
      include: ['src/**/*'],
      exclude: ['node_modules'],
      requireEnv: false,
    }),
  ],
});