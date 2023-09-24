import pkj from '../../../package.json' assert { type: 'json' };
import * as path from 'path';

import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';

import initIPC, { dispatch } from './modules/ipc';
import { getSettings } from './modules/settings';
import { log } from './modules/logger';

import * as ipc from '~/common/ipc';

app.setAboutPanelOptions({
	applicationName: 'RelaGit',
	applicationVersion: pkj.version,
	version: __COMMIT_HASH__,
	copyright: 'Copyright © 2023 TheCommieAxolotl & RelaGit contributors',
	website: 'https://rela.dev'
});

app.once('ready', async () => {
	const settings = await getSettings();

	const win = new BrowserWindow({
		titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
		title: 'RelaGit',
		vibrancy: settings.get('vibrancy') ? 'sidebar' : undefined,
		visualEffectState: settings.get('vibrancy') ? 'active' : undefined,
		height: 850,
		width: 1200,
		minWidth: 500,
		minHeight: 500,
		show: false,
		webPreferences: {
			devTools: __NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true',
			preload: path.resolve(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	win.once('ready-to-show', () => {
		win.show();
	});

	win.webContents.on('before-input-event', (event, input) => {
		if (
			(process.platform === 'darwin' && input.meta && input.key === 'k') ||
			(input.control && input.key === 'k')
		) {
			win.webContents.send(ipc.OPEN_SWITCHER);
			win.webContents.send(ipc.OPEN_SIDEBAR, true);

			event.preventDefault();
		}

		if (
			(process.platform === 'darwin' && input.meta && input.key === 's') ||
			(input.control && input.key === 's')
		) {
			win.webContents.send(ipc.OPEN_SIDEBAR);

			event.preventDefault();
		}
	});

	log('Startup' + (__NODE_ENV__ === 'development' ? ' (development)' : ' (production)'));
	log('Version: ' + pkj.version);
	log('Running on: ' + process.platform + ' ' + process.arch);

	win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));

	win.once('ready-to-show', () => {
		win.show();
	});

	initIPC(win);

	const menu = Menu.buildFromTemplate([
		{
			role: 'appMenu',
			label: 'RelaGit',
			submenu: [
				{
					role: 'about',
					label: 'About RelaGit'
				},
				{
					type: 'separator'
				},
				{
					role: 'services'
				},
				{
					type: 'separator'
				},
				{
					label: 'Preferences',
					accelerator: 'CmdOrCtrl+,',
					click: () => {
						dispatch(win, ipc.OPEN_SETTINGS);
					}
				},
				{
					type: 'separator'
				},
				{
					role: 'hide',
					label: 'Hide RelaGit'
				},
				{
					role: 'hideOthers'
				},
				{
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					role: 'quit',
					label: 'Quit RelaGit'
				}
			]
		},
		{
			role: 'editMenu'
		},
		{
			label: 'Window',
			submenu: [
				{
					role: 'minimize'
				},
				{
					role: 'zoom'
				},
				{
					type: 'separator'
				},
				{
					role: 'front'
				},
				{
					type: 'separator'
				},
				{
					role: 'close'
				},
				{
					role: 'reload'
				},
				{
					role: 'togglefullscreen'
				},
				(__NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true') && {
					type: 'separator'
				},
				/*(__NODE_ENV__ === "development" || process.env.DEBUG_PROD === "true") &&*/ {
					role: 'toggleDevTools'
				}
			].filter(Boolean) as MenuItemConstructorOptions[]
		}
	]);

	Menu.setApplicationMenu(menu);
});
