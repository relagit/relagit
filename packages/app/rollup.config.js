import { fileURLToPath } from 'node:url';
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
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IS_DEV = process.env.npm_lifecycle_event === 'dev';

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
		IS_DEV && sourcemaps(),
		replace({
			preventAssignment: true,
			values: {
				__NODE_ENV__: JSON.stringify(IS_DEV ? 'development' : 'production')
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
		}),
		!IS_DEV && terser()
	].filter(Boolean)
});
