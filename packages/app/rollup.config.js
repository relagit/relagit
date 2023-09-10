import Module from 'node:module';
import path from 'node:path';
import sass from 'sass';

import { defineConfig } from 'rollup';

import nodeResolve from '@rollup/plugin-node-resolve';
import tsconfig from 'rollup-plugin-tsconfig-paths';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import esbuild from 'rollup-plugin-esbuild';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
	input: path.join(__dirname, 'src', 'index.tsx'),
	output: {
		format: 'iife',
		file: path.resolve('dist', 'renderer.js'),
		inlineDynamicImports: true,
		sourcemap: true
	},
	external: Module.builtinModules.concat(['electron']),
	plugins: [
		sourcemaps(),
		replace({
			preventAssignment: true,
			values: {
				__NODE_ENV__: JSON.stringify(
					process.env.ROLLUP_WATCH ? 'development' : 'production'
				)
			}
		}),
		json(),
		commonjs(),
		scss({
			sass: sass,
			fileName: 'style.css'
		}),
		tsconfig({
			tsConfigPath: path.resolve(__dirname, './tsconfig.json')
		}),
		nodeResolve({
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss', '.sass', '.css'],
			browser: true,
			exportConditions: ['development', 'browser']
		}),
		esbuild({
			minify: false,
			sourceMap: true
		}),
		babel({
			presets: ['babel-preset-solid'],
			extensions: ['.tsx'],
			babelHelpers: 'bundled'
		})
	].filter(Boolean)
});
