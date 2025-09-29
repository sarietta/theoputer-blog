import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: [
    'svg-viewer.ts',
    'figcite.ts',
    'falstad-circuit.ts',
  ],
  output: {
    dir: '../static/js/components/', // The final JavaScript bundle
    format: 'es', // The output format (e.g., 'es' for ES modules)
    sourcemap: true
  },
  plugins: [
    typescript({
      // You can pass options to the TypeScript compiler here if needed
      // but often it's better to rely on tsconfig.json
    }),
    nodeResolve()
  ]
};
