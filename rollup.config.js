import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
  {
    input: 'molijv.js',
    output: [
      { file: 'dist/molijv.mjs', format: 'esm' },
      { file: 'dist/molijv.cjs', format: 'cjs' }
    ],
    plugins: [resolve(), commonjs()]
  }
]
