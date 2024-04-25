import dotenv from 'dotenv';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { replaceCodePlugin } from 'vite-plugin-replace';
import solid from 'vite-plugin-solid';
import tsconfig from 'vite-tsconfig-paths';

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
	dotenv.config({
		path: resolve(__dirname, '.env.local')
	});
} catch (e) {
	console.error(e);
	console.error('Failed to load .env.local');
}

const GIT_COMMIT_HASH = execSync('git rev-parse HEAD').toString().trim().substring(0, 7);

const IS_DEV = process.env.npm_lifecycle_event?.startsWith('dev');

const dist = resolve(__dirname, 'dist');

if (!fs.existsSync(dist)) {
	fs.mkdirSync(dist);
}

fs.writeFileSync(
	path.join(dist, 'build_info.json'),
	JSON.stringify({
		commit: GIT_COMMIT_HASH,
		date: new Date().toISOString(),
		env: IS_DEV ? 'development' : 'production'
	})
);

const paths: import('vite').AliasOptions = {
	'~/*': resolve(__dirname, './packages/*'),
	'@/*': resolve(__dirname, './packages/app/src/*'),
	'@app/*': resolve(__dirname, './packages/app/src/*'),
	'@ui/*': resolve(__dirname, './packages/app/src/ui/*'),
	'@stores/*': resolve(__dirname, './packages/app/src/stores/*'),
	'@modules/*': resolve(__dirname, './packages/app/src/modules/*')
};

const commonPlugins: import('vite').PluginOption = [
	tsconfig(),
	replaceCodePlugin({
		replacements: [
			{
				from: /__NODE_ENV__/g,
				to: JSON.stringify(IS_DEV ? 'development' : 'production')
			},
			{
				from: /__COMMIT_HASH__/g,
				to: JSON.stringify(GIT_COMMIT_HASH)
			},
			{
				from: /__GITHUB_CLIENT_ID__/g,
				to: JSON.stringify(process.env.GITHUB_CLIENT_ID)
			},
			{
				from: /__GITLAB_CLIENT_ID__/g,
				to: JSON.stringify(process.env.GITLAB_CLIENT_ID)
			},
			{
				from: /__CODEBERG_CLIENT_ID__/g,
				to: JSON.stringify(process.env.CODEBERG_CLIENT_ID)
			},
			{
				from: /__AI_API_URL__/g,
				to: JSON.stringify(process.env.AI_API_URL)
			},
			{
				from: /__AI_API_PASSWORD__/g,
				to: JSON.stringify(process.env.AI_API_PASSWORD)
			}
		]
	})
];

export default defineConfig({
	main: {
		resolve: {
			alias: paths,
			conditions: ['browser', 'node']
		},
		publicDir: resolve(__dirname, 'public'),
		build: {
			outDir: resolve(__dirname, 'dist/main'),
			minify: 'esbuild',
			lib: {
				entry: resolve(__dirname, 'packages/main/src/index.ts')
			}
		},
		plugins: commonPlugins.concat(externalizeDepsPlugin())
	},
	preload: {
		publicDir: resolve(__dirname, 'public'),
		build: {
			outDir: resolve(__dirname, 'dist/preload'),
			minify: 'esbuild',
			lib: {
				entry: resolve(__dirname, 'packages/main/src/preload.ts')
			}
		},
		resolve: {
			alias: paths,
			conditions: ['browser', 'node']
		},
		plugins: commonPlugins.concat(externalizeDepsPlugin())
	},
	renderer: {
		root: resolve(__dirname, 'packages/app'),
		publicDir: resolve(__dirname, 'public'),
		build: {
			outDir: resolve(__dirname, 'dist/app'),
			minify: 'esbuild',
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'packages/app/index.html'),
					popout: resolve(__dirname, 'packages/app/popout/index.html')
				}
			}
		},
		resolve: {
			alias: paths,
			conditions: ['browser', 'node']
		},
		plugins: commonPlugins.concat(solid(), {
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
		})
	}
});
