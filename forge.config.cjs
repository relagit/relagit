/* eslint-disable @typescript-eslint/no-var-requires */

const build = require('./dist/build_info.json');
const path = require('path');
const fs = require('fs');

const out = {
	macos: fs.existsSync(path.join(__dirname, 'out', 'RelaGit-darwin-x64', 'RelaGit.app'))
		? path.join(__dirname, 'out', 'RelaGit-darwin-x64', 'RelaGit.app')
		: path.join(__dirname, 'out', 'RelaGit-darwin-arm64', 'RelaGit.app')
};

module.exports = {
	packagerConfig: {
		name: 'RelaGit',
		appBundleId: 'com.rela.git',
		icon: build.env === 'development' ? './icons/gold' : './icons/dark',
		executableName: 'relagit'
	},
	makers: [
		{
			name: '@electron-forge/maker-dmg',
			platforms: ['darwin'],
			config: {
				background: './icons/dmg-background.png',
				format: 'ULFO',
				name: 'RelaGit',
				overwrite: true,
				icon: './icons/light.icns',
				iconSize: 72,
				additionalDMGOptions: {
					'background-color': '#000'
				},
				contents: [
					{ x: 462, y: 160, type: 'link', path: '/Applications' },
					{
						x: 155,
						y: 160,
						type: 'file',
						path: out.macos
					}
				]
			}
		},
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'RelaGit'
			}
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				name: 'RelaGit'
			}
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {
				name: 'RelaGit'
			}
		}
	]
};
