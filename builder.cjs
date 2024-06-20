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
	protocols: {
		name: 'relagit',
		schemes: ['relagit']
	},
	extraMetadata: {
		main: 'dist/main/index.js',
		homepage: 'https://rela.dev',
		source: 'github:relagit/relagit'
	},
	appId: 'com.relagit.app',
	productName: 'RelaGit',
	artifactName: '${productName}-${os}.${ext}',
	directories: {
		output: 'out'
	},
	icon: buildInfo.env === 'development' ? './build/dev' : './build/icon',
	asar: false, // we need to disable asar because of the way vscode-oniguruma is built
	// asarUnpack: ['node_modules'],
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
		sign: false,
		background: './build/background.png',
		icon: './build/dmg.icns',
		iconSize: 72,
		window: {
			width: 616,
			height: 370
		},
		contents: [
			{
				x: 462,
				y: 132,
				type: 'link',
				path: '/Applications'
			},
			{
				x: 155,
				y: 132,
				type: 'file'
			}
		]
	},
	mac: {
		identity: null,
		category: 'public.app-category.developer-tools',
		darkModeSupport: true,
		hardenedRuntime: true,
		entitlements: './build/entitlements.mac.plist',
		entitlementsInherit: './build/entitlements.mac.plist',
		artifactName: '${productName}-${os}-${arch}.${ext}',
		extendInfo: {
			CFBundleDocumentTypes: [
				{
					CFBundleTypeExtensions: [],
					CFBundleTypeIconFile: 'default.icns',
					CFBundleTypeName: 'Folder',
					CFBundleTypeOSTypes: ['TEXT', 'utxt', 'TUTX', '****'],
					CFBundleTypeRole: 'Viewer',
					LSItemContentTypes: ['public.folder']
				}
			]
		},
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
		target: ['deb', 'tar.gz', 'rpm'],
		icon: buildInfo.env === 'development' ? './build/dev_lin.png' : './build/icon_lin.png'
	},
	win: {
		target: [
			{
				target: 'nsis',
				arch: ['x64']
			},
			{
				target: 'zip',
				arch: ['x64']
			}
		],
		icon: buildInfo.env === 'development' ? './build/win/dev.png' : './build/win/icon.png'
	},
	nsis: {
		oneClick: false,
		perMachine: true,
		allowElevation: true,
		allowToChangeInstallationDirectory: true,
		createDesktopShortcut: true,
		createStartMenuShortcut: true,
		installerIcon: './build/win/dmg.ico'
	},
	files: ['dist', 'public', 'package.json', 'LICENSE']
};

module.exports = config;
