import commonjs from '@rollup/plugin-commonjs'
import { default as resolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import dts from 'rollup-plugin-dts'
import external from 'rollup-plugin-peer-deps-external'
import terser from '@rollup/plugin-terser'
import tsConfigPaths from 'rollup-plugin-tsconfig-paths'
import packageJson from './package.json' with { type: 'json' }

export default [
	// CJS build without declarations
	{
		input: './src/build.ts',
		output: {
			file: packageJson.exports.require,
			format: 'cjs',
			sourcemap: false,
			name: 'react-ts-lib'
		},
		plugins: [
			tsConfigPaths(),
			external(),
			resolve(),
			commonjs(),
			typescript({
				tsconfig: './tsconfig.build.json',
				compilerOptions: {
					outDir: 'dist/cjs'
				}
			}),
			terser()
		],
		external: ['react', 'react-dom', 'styled-components', 'react-redux']
	},
	// ESM build with declarations
	{
		input: './src/build.ts',
		output: {
			file: packageJson.exports.import,
			format: 'esm',
			sourcemap: false
		},
		plugins: [
			tsConfigPaths(),
			external(),
			resolve(),
			commonjs(),
			typescript({
				tsconfig: './tsconfig.build.json',
				compilerOptions: {
					declaration: true,
					declarationDir: 'dist/esm/types',
					outDir: 'dist/esm'
				}
			}),
			terser()
		],
		external: ['react', 'react-dom', 'styled-components', 'react-redux']
	},
	{
		input: './dist/esm/types/src/build.d.ts',
		output: [{ file: './dist/index.d.ts', format: 'esm' }],
		plugins: [
			tsConfigPaths('./tsconfig.build.json'),
			dts(),
			del({
				targets: ['./dist/cjs/types', './dist/esm/types'],
				hook: 'buildEnd'
			})
		],
		external: ['react', 'react-dom', 'styled-components']
	}
]
