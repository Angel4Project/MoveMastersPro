import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    // Development server configuration
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: false,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },

    // Build configuration
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          // Optimized manual chunks for better caching and loading
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('firebase')) {
                return 'firebase-vendor';
              }
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'ui-vendor';
              }
              if (id.includes('react-router')) {
                return 'router-vendor';
              }
              if (id.includes('@google') || id.includes('googleapis')) {
                return 'google-vendor';
              }
              return 'vendor';
            }

            // Application chunks
            if (id.includes('services/')) {
              return 'services';
            }
            if (id.includes('components/')) {
              return 'components';
            }
            if (id.includes('pages/')) {
              return 'pages';
            }
            if (id.includes('context/')) {
              return 'context';
            }
          },
          // Optimized asset naming with content hashing
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (/\.(woff|woff2|eot|ttf|otf)$/i.test(name)) {
              return `fonts/[name]-[hash][extname]`;
            }
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
              return `images/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js'
        },
        // External dependencies that shouldn't be bundled
        external: [
          '@google/genai',
          'winston'
        ]
      }
    },

    // Plugin configuration
    plugins: [
      react({
        // JSX runtime
        jsxRuntime: 'automatic',
        // Exclude certain files from transformation
        exclude: [/[/\\]node_modules[/\\]/]
      })
    ],

    // Define global constants
    define: {
      // Environment variables
      __DEV__: !isProduction,
      __PROD__: isProduction,
      
      // API Keys (only expose safe ones)
      ...(env.GEMINI_API_KEY && {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      }),
      ...(env.VITE_FIREBASE_API_KEY && {
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY)
      }),
      ...(env.VITE_FIREBASE_AUTH_DOMAIN && {
        'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN)
      }),
      ...(env.VITE_FIREBASE_PROJECT_ID && {
        'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID)
      }),
      
      // Global version info
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0')
    },

    // Resolve configuration
    resolve: {
      alias: {
        // Force single React instance to fix forwardRef errors
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        // Project aliases
        '@': path.resolve(__dirname, './'),
        '@components': path.resolve(__dirname, './components'),
        '@pages': path.resolve(__dirname, './pages'),
        '@services': path.resolve(__dirname, './services'),
        '@utils': path.resolve(__dirname, './utils'),
        '@types': path.resolve(__dirname, './types'),
        '@context': path.resolve(__dirname, './context'),
        '@assets': path.resolve(__dirname, './public'),
        '@styles': path.resolve(__dirname, './src/styles')
      },
      // File extensions to try when resolving imports
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue']
    },

    // CSS configuration
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        },
        less: {
          javascriptEnabled: true
        }
      }
    },

    // Worker configuration
    worker: {
      format: 'es'
    },

    // JSON configuration
    json: {
      namedExports: true,
      stringify: false
    },

    // WebAssembly configuration
    wasm: {
      // Support WebAssembly
      experimentalInstantiation: true
    },

    // Asset URL handling
    assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.exr', '**/*.tga', '**/*.ktx2'],

    // Preview server configuration
    preview: {
      port: 4173,
      host: '0.0.0.0',
      strictPort: false
    },

    // Environment variables validation
    envPrefix: [
      'VITE_',
      'REACT_APP_',
      'GEMINI_',
      'FIREBASE_',
      'EMAILJS_',
      'TELEGRAM_',
      'GOOGLE_'
    ],

    // Performance optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'framer-motion',
        'lucide-react',
        'zod'
      ],
      exclude: ['@vite/client', '@vite/env']
    },

    // Performance monitoring
    esbuild: {
      target: 'esnext',
      platform: 'browser',
      // Tree shaking
      treeShaking: isProduction,
      // Drop debugger and console in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Minify configuration
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction
    },

    // Cache configuration
    cacheDir: 'node_modules/.vite',

    // Log configuration
    logLevel: isProduction ? 'info' : 'warn',

    // Public directory
    publicDir: 'public'
  };
});
