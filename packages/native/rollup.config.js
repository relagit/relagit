import Module from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

import { defineConfig } from 'rollup';

import nodeResolve from '@rollup/plugin-node-resolve';
import tsconfig from 'rollup-plugin-tsconfig-paths';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import esbuild from 'rollup-plugin-esbuild';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const IS_DEV = process.env.npm_lifecycle_event === 'dev';

let dist = path.join(__dirname, '../../dist');

if (process.platform === 'win32') {
	dist = dist.replace(/^\\/g, '');
}

if (!fs.existsSync(path.join(dist, 'package.json'))) {
	if (!fs.existsSync(dist)) {
		fs.mkdirSync(dist);
	}

	fs.writeFileSync(
		path.join(dist, 'package.json'),
		JSON.stringify({
			type: 'commonjs'
		})
	);
}

export default defineConfig({
	input: {
		main: path.join(__dirname, './src/index.ts'),
		preload: path.join(__dirname, './src/preload.ts')
	},
	output: {
		format: 'cjs',
		dir: path.resolve(__dirname, '../../dist')
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
		tsconfig({
			tsConfigPath: path.resolve(__dirname, '../../tsconfig.json')
		}),
		nodeResolve({
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss', '.sass', '.css'],
			browser: true,
			exportConditions: ['development', 'browser']
		}),
		commonjs(),
		esbuild({
			minify: false,
			sourceMap: true
		}),
		json({
			compact: true
		}),
		!IS_DEV && terser()
	].filter(Boolean)
});
