import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import dotenv from 'dotenv';
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import scss from 'rollup-plugin-scss';
import sourcemaps from 'rollup-plugin-sourcemaps';
import tsconfig from 'rollup-plugin-tsconfig-paths';

import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IS_DEV = process.env.npm_lifecycle_event.startsWith('dev');
let ENV = {};

try {
	ENV = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '.env.client'), 'utf-8'));
} catch {}

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
				__NODE_ENV__: JSON.stringify(IS_DEV ? 'development' : 'production'),
				__GITHUB_CLIENT_ID__: JSON.stringify(
					process.env.GITHUB_CLIENT_ID || ENV.GITHUB_CLIENT_ID
				)
			}
		}),
		json({
			compact: true
		}),
		commonjs(),
		scss({
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
			babelHelpers: 'bundled',
			parserOpts: {
				plugins: ['importAssertions']
			}
		}),
		!IS_DEV && terser(),
		{
			version: '0.0.1',
			name: 'plugin-filecontent',
			resolveId(source) {
				if (source.startsWith('@content/')) {
					return source.replace('@content/', '_LOAD_CONTENT_/');
				}
			},
			load(id) {
				if (id.startsWith('_LOAD_CONTENT_/')) {
					const file = fs.readFileSync(
						id.replace('_LOAD_CONTENT_/', './packages/app/src/'),
						'utf-8'
					);

					return `export default ${JSON.stringify(file)}`;
				}
			}
		}
	].filter(Boolean)
});
