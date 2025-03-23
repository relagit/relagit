import * as Sentry from '@sentry/electron/main';
import {
	BrowserWindow,
	Menu,
	MenuItemConstructorOptions,
	app,
	ipcMain,
	nativeImage,
	nativeTheme,
	webContents
} from 'electron';
import { autoUpdater } from 'electron-updater';
import * as ipc from '~/shared/ipc';

import * as path from 'path';

// @ts-expect-error - png types lmao
import icon from '../../../build/icon_lin.png?asset';
import pkj from '../../../package.json';
import initIPC, { dispatch } from './modules/ipc';
import { log } from './modules/logger';
import openPopout, { popout, reposition } from './modules/popout';
import initProtocol from './modules/protocol';
import { backgroundFromTheme, editorName, getSettings, updateSettings } from './modules/settings';
import { updateEnvironmentForProcess } from './modules/shell';
import { getPlatformWindowOptions } from './modules/window';

app.setAboutPanelOptions({
	applicationName: 'RelaGit',
	applicationVersion: pkj.version,
	version: __COMMIT_HASH__,
	copyright: 'Copyright © 2023-2024 TheCommieAxolotl & RelaGit contributors',
	website: 'https://rela.dev'
});

const listeners: ((window: BrowserWindow) => void)[] = [];
let loaded = false;
let windowShown = false;

// TODO: Fix auto-updater
/* eslint-disable @typescript-eslint/no-unused-vars */
const updateCheck = () => {
	if (__NODE_ENV__ === 'development') return;

	autoUpdater.checkForUpdatesAndNotify();

	autoUpdater.logger = {
		info: (message: string) =>
			webContents
				.getAllWebContents()
				.forEach((w) =>
					w.executeJavaScript(
						`console.info(\`${
							typeof message === 'string' ? message.replace('`', '\\`') : message
						}\`)`
					)
				),
		error: (message: string) =>
			webContents
				.getAllWebContents()
				.forEach((w) =>
					w.executeJavaScript(
						`console.error(\`${
							typeof message === 'string' ? message.replace('`', '\\`') : message
						}\`)`
					)
				),
		warn: (message: string) =>
			webContents
				.getAllWebContents()
				.forEach((w) =>
					w.executeJavaScript(
						`console.warn(\`${
							typeof message === 'string' ? message.replace('`', '\\`') : message
						}\`)`
					)
				)
	};
};

// app.on('ready', () => {
// 	updateCheck();
// });

// setInterval(updateCheck, 60000);

Sentry.init({
	dsn: 'https://858276c018bc5509422b914a744efa98@o4507749705252864.ingest.de.sentry.io/4507749717442640'
});

const constructWindow = async () => {
	const settings = await getSettings();

	const isOnboarding = () => {
		const onboarding = settings.onboarding;

		if (!onboarding) return true;

		return onboarding.dismissed !== true && onboarding.step === 0;
	};

	if (isOnboarding()) {
		await updateSettings({
			ui: {
				...settings.ui,
				vibrancy: process.platform === 'darwin' || process.platform === 'win32'
			}
		});
	}

	const win = new BrowserWindow({
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			height: 27,
			color: backgroundFromTheme(
				settings.ui?.theme || 'system',
				nativeTheme.shouldUseDarkColors
			),
			symbolColor: '#cacaca'
		},
		title: 'RelaGit',
		height: settings.window?.height || 600,
		width: settings.window?.width || 1000,
		minWidth: 500,
		minHeight: 500,
		x: settings.window?.x || undefined,
		y: settings.window?.y || undefined,
		show: false,
		icon: process.platform === 'linux' ? icon : undefined,
		...getPlatformWindowOptions(isOnboarding(), settings),
		webPreferences: {
			devTools: __NODE_ENV__ === 'development' || process.argv.includes('--devtools'),
			preload: path.join(__dirname, '../preload/preload.mjs'),
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	if (process.argv.includes('--devtools')) {
		win.webContents.openDevTools();
	}

	win.once('ready-to-show', () => {
		if (!windowShown) {
			windowShown = true;
			win.show();
		}
	});

	win.webContents.once('did-finish-load', () => {
		if (!windowShown) {
			windowShown = true;
			win.show();
		}

		if (loaded) return;
		loaded = true;
		for (const listener of listeners) {
			listener(win);
		}
	});

	ipcMain.once('renderer-ready', (_, readyTime) => {
		log(`Renderer ready in ${readyTime}ms`);

		if (loaded) return;

		loaded = true;

		for (const listener of listeners) {
			listener(win);
		}
	});

	win.on('move', () => {
		updateSettings({
			window: {
				...settings.window,
				x: win.getPosition()[0],
				y: win.getPosition()[1]
			}
		});
	});

	win.on('resize', () => {
		updateSettings({
			window: {
				...settings.window,
				width: win.getSize()[0],
				height: win.getSize()[1],
				x: win.getPosition()[0],
				y: win.getPosition()[1]
			}
		});
	});

	win.on('focus', () => {
		dispatch(ipc.FOCUS, true);
	});

	win.on('blur', () => {
		dispatch(ipc.FOCUS, false);
	});

	log('Startup' + (__NODE_ENV__ === 'development' ? ' (development)' : ' (production)'));
	log('Version: ' + pkj.version);
	log('Running on: ' + process.platform + ' ' + process.arch);
	log('Commit: ' + __COMMIT_HASH__);

	if (__NODE_ENV__ === 'development' && process.env['ELECTRON_RENDERER_URL']) {
		win.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		win.loadFile(path.join(__dirname, '../app/index.html'));
	}

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
					type: 'separator'
				},
				{
					label: 'Preferences',
					accelerator: 'CmdOrCtrl+,',
					click: () => {
						dispatch(ipc.OPEN_SETTINGS);
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
			label: 'View',
			submenu: [
				{
					label: 'Sidebar',
					accelerator: 'CmdOrCtrl+S',
					click: () => {
						dispatch(ipc.OPEN_SIDEBAR);
					}
				},
				{
					label: 'Repositories',
					accelerator: 'CmdOrCtrl+D',
					click: () => {
						dispatch(ipc.OPEN_SWITCHER);
						dispatch(ipc.OPEN_SIDEBAR, true);
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Command Palette',
					accelerator: 'CmdOrCtrl+K',
					click: () => {
						dispatch(ipc.OPEN_PALETTE);
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Commit History',
					accelerator: 'CmdOrCtrl+L',
					click: () => {
						dispatch(ipc.OPEN_HISTORY);
					}
				},
				{
					label: 'Branches',
					accelerator: 'CmdOrCtrl+M',
					click: () => {
						dispatch(ipc.OPEN_BRANCHES);
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Information Modal',
					accelerator: 'CmdOrCtrl+I',
					click: () => {
						dispatch(ipc.OPEN_INFORMATION);
					}
				},
				{
					label: 'Command Log',
					accelerator: 'CmdOrCtrl+U',
					click: () => {
						dispatch(ipc.OPEN_LOG);
					}
				}
			]
		},
		{
			label: 'Repository',
			submenu: [
				{
					label: 'Create Repository',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						dispatch(ipc.OPEN_CREATE);
					}
				},
				{
					label: 'Add Repository',
					accelerator: 'CmdOrCtrl+O',
					click: () => {
						dispatch(ipc.OPEN_ADD);
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Clone Repository',
					accelerator: 'CmdOrCtrl+Shift+O',
					click: () => {
						dispatch(ipc.OPEN_CLONE);
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Open Remote',
					accelerator: 'CmdOrCtrl+Shift+G',
					click: () => {
						dispatch(ipc.OPEN_REMOTE);
					}
				},
				{
					label: `View in ${process.platform === 'darwin' ? 'Finder' : 'Explorer'}`,
					accelerator: 'CmdOrCtrl+Shift+F',
					click: () => {
						dispatch(ipc.SHOW_IN_FOLDER);
					}
				},
				{
					label: `Open in ${editorName(settings.externalEditor)}`,
					accelerator: 'CmdOrCtrl+Shift+C',
					click: () => {
						dispatch(ipc.OPEN_EDITOR);
					}
				}
			]
		},
		{
			label: 'Popout',
			submenu: [
				{
					label: 'Show Popout',
					accelerator: 'CmdOrCtrl+P',
					click: () => {
						openPopout();
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Align',
					submenu: [
						{
							icon: nativeImage.createFromNamedImage('NSRectangle'),
							label: 'Top Left',
							click: () => {
								reposition('top-left');
							}
						},
						{
							label: 'Top Right',
							click: () => {
								reposition('top-right');
							}
						},
						{
							label: 'Bottom Left',
							click: () => {
								reposition('bottom-left');
							}
						},
						{
							label: 'Bottom Right',
							click: () => {
								reposition('bottom-right');
							}
						}
					]
				}
			]
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
					role: 'quit',
					label: 'Quit RelaGit'
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
				(__NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true') && {
					role: 'toggleDevTools'
				}
			].filter(Boolean) as MenuItemConstructorOptions[]
		}
	]);

	Menu.setApplicationMenu(menu);

	return win;
};

let mainWindow: BrowserWindow | null = null;

app.once('ready', async () => {
	const window = await constructWindow();

	mainWindow = window;

	initIPC(window);
	initProtocol();
	if (process.platform === 'darwin') updateEnvironmentForProcess();

	app.on('activate', async () => {
		// either no windows, or the only window is the popout
		if (
			BrowserWindow.getAllWindows().length === 0 ||
			(BrowserWindow.getAllWindows().length === 1 && popout?.isVisible())
		) {
			const newWindow = await constructWindow();

			mainWindow = newWindow;

			initIPC(newWindow);
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.setAsDefaultProtocolClient('relagit');
const lock = app.requestSingleInstanceLock();

if (!lock) {
	app.quit();
}

const onLoaded = (cb: (window: BrowserWindow) => void) => {
	if (loaded) {
		cb(mainWindow!);
	} else {
		listeners.push(cb);
	}
};

app.on('open-url', (_, url) => {
	onLoaded((window) => {
		if (window.isMinimized()) {
			window.restore();
		}

		window.focus();

		if (url.includes('/oauth-captive')) {
			window.webContents.send(ipc.OAUTH_CAPTIVE, url);
		}

		if (url.includes('/clone/')) {
			window.webContents.send(ipc.CLONE_CAPTIVE, url);
		}
	});
});

app.on('second-instance', (_, commandLine) => {
	onLoaded((window) => {
		if (window.isMinimized()) {
			window.restore();
		}

		window.focus();

		const url = commandLine.pop();

		if (url?.includes('/oauth-captive')) {
			window.webContents.send(ipc.OAUTH_CAPTIVE, url);
		}

		if (url?.includes('/clone/')) {
			window.webContents.send(ipc.CLONE_CAPTIVE, url);
		}
	});
});

app.on('open-file', (e, path) => {
	e.preventDefault();

	onLoaded((window) => {
		window.webContents.send(ipc.OPEN_ADD, path);
	});
});

if (process.argv.slice(2)[0]) {
	onLoaded((window) => window.webContents.send(ipc.OPEN_ADD, process.argv.slice(2)[0]));
}
