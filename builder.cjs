/* eslint-disable @typescript-eslint/no-var-requires */

const cp = require('child_process');
const fs = require('fs');
const util = require('util');

const exec = util.promisify(cp.exec);

/**
 * @type {{
	commit: string;
	date: string;
	env: 'development' | 'production';
}}
 */
const buildInfo = JSON.parse(fs.readFileSync('./dist/build_info.json', 'utf-8'));

/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
	extends: null,
	extraMetadata: {
		main: 'dist/main.js',
		homepage: 'https://git.rela.dev',
		source: 'github:relagit/relagit'
	},
	appId: 'com.relagit.app',
	productName: 'RelaGit',
	artifactName: '${productName}-${os}.${ext}',
	directories: {
		output: 'out'
	},
	icon: buildInfo.env === 'development' ? './build/dev' : './build/icon',
	asar: false, // we cannot build as asar because vscode-oniguruma needs to be required from starry-night
	afterPack: async () => {
		if (process.platform !== 'darwin') return;

		console.log('Signing app...');

		// we are forced to do this becuase apple locks unsigned apps on macOS 11+ on ARM machines

		try {
			const cmd = 'codesign --force --deep -s - ./out/mac-arm64/RelaGit.app';

			await exec(cmd);
		} catch (err) {
			console.warn('Failed to sign arm64');
		}

		try {
			const cmd = 'codesign --force --deep -s - ./out/mac/RelaGit.app';

			await exec(cmd);
		} catch (err) {
			console.warn('Failed to sign x64');
		}
	},
	dmg: {
		background: './build/background.png',
		icon: './build/dmg.icns',
		iconSize: 72,
		contents: [
			{
				x: 462,
				y: 160,
				type: 'link',
				path: '/Applications'
			},
			{
				x: 155,
				y: 160,
				type: 'file'
			}
		]
	},
	mac: {
		identity: null,
		category: 'public.app-category.developer-tools',
		darkModeSupport: true,
		artifactName: '${productName}-${os}-${arch}.${ext}',
		target: [
			{
				target: 'dmg',
				arch: ['arm64', 'x64']
			},
			{
				target: 'zip',
				arch: ['arm64', 'x64']
			}
		]
	},
	linux: {
		category: 'Developer',
		maintainer: 'TheCommieAxolotl',
		target: ['deb', 'tar.gz', 'rpm']
	},
	win: {
		target: ['zip']
	},
	files: ['dist', 'public', 'package.json', 'LICENSE']
};

module.exports = config;
