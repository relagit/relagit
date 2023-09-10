import Module from 'node:module';
import path from 'node:path';

import { defineConfig } from 'rollup';

import nodeResolve from '@rollup/plugin-node-resolve';
import tsconfig from 'rollup-plugin-tsconfig-paths';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
	input: {
		main: path.join(__dirname, './src/index.ts'),
		preload: path.join(__dirname, './src/preload.ts')
	},
	output: {
		format: 'cjs',
		dir: path.resolve('dist')
	},
	external: Module.builtinModules.concat(['electron', '@swc/core']),
	plugins: [
		commonjs(),
		replace({
			preventAssignment: true,
			values: {
				__NODE_ENV__: JSON.stringify(
					process.env.ROLLUP_WATCH ? 'development' : 'production'
				)
			}
		}),
		tsconfig({
			tsConfigPath: path.resolve(__dirname, '../../tsconfig.json')
		}),
		nodeResolve({
			extensions: ['.ts', '.json']
		}),
		esbuild(),
		json({
			compact: true
		})
	].filter(Boolean)
});
