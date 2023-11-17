import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import sourcemaps from 'rollup-plugin-sourcemaps';
import tsconfig from 'rollup-plugin-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GIT_COMMIT_HASH = execSync('git rev-parse HEAD').toString().trim().substring(0, 7);

const IS_DEV = process.env.npm_lifecycle_event.startsWith('dev');

const dist = path.join(__dirname, '../../dist');

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

fs.writeFileSync(
	path.join(dist, 'build_info.json'),
	JSON.stringify({
		commit: GIT_COMMIT_HASH,
		date: new Date().toISOString(),
		env: IS_DEV ? 'development' : 'production'
	})
);

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
				__NODE_ENV__: JSON.stringify(IS_DEV ? 'development' : 'production'),
				__COMMIT_HASH__: JSON.stringify(GIT_COMMIT_HASH)
			}
		}),
		tsconfig({
			tsConfigPath: path.resolve(__dirname, './tsconfig.json')
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
