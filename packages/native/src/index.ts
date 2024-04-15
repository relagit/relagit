import {
	BrowserWindow,
	Menu,
	MenuItemConstructorOptions,
	app,
	nativeImage,
	nativeTheme,
	webContents
} from 'electron';
import { autoUpdater } from 'electron-updater';

import * as path from 'path';

import * as ipc from '~/common/ipc';

import pkj from '../../../package.json' assert { type: 'json' };
import initIPC, { dispatch } from './modules/ipc';
import { log } from './modules/logger';
import openPopout, { popout, reposition } from './modules/popout';
import initProtocol from './modules/protocol';
import { backgroundFromTheme, editorName, getSettings, updateSettings } from './modules/settings';
import { updateEnvironmentForProcess } from './modules/shell';

app.setAboutPanelOptions({
	applicationName: 'RelaGit',
	applicationVersion: pkj.version,
	version: __COMMIT_HASH__,
	copyright: 'Copyright © 2023-2024 TheCommieAxolotl & RelaGit contributors',
	website: 'https://git.rela.dev'
});

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

app.on('ready', () => {
	updateCheck();
});

setInterval(updateCheck, 60000);

const constructWindow = async () => {
	const settings = await getSettings();

	const isOnboarding = () => {
		const onboarding = settings.onboarding;

		if (!onboarding) return true;

		return onboarding.dismissed !== true && onboarding.step === 0;
	};

	let vibrancy:
		| 'sidebar'
		| 'fullscreen-ui'
		| 'selection'
		| 'menu'
		| 'popover'
		| 'sidebar-header'
		| 'titlebar'
		| 'header'
		| 'sheet'
		| 'window'
		| undefined = settings.ui?.vibrancy ? 'sidebar' : undefined;
	let backgroundMaterial: 'mica' | 'auto' | 'none' | 'acrylic' | 'tabbed' | undefined =
		settings.ui?.vibrancy ? 'mica' : undefined;
	let transparent = settings.ui?.vibrancy && process.platform === 'win32' ? true : undefined;
	let backgroundColor =
		settings.ui?.vibrancy ?
			'#00000000'
		:	backgroundFromTheme(settings.ui?.theme || '', nativeTheme.shouldUseDarkColors);

	if (isOnboarding()) {
		vibrancy = 'sidebar';
		backgroundMaterial = 'mica';
		transparent = process.platform === 'win32';
		backgroundColor = '#00000000';

		await updateSettings({
			ui: {
				...settings.ui,
				vibrancy: true
			}
		});
	}

	if (process.platform === 'linux') {
		vibrancy = undefined;
		backgroundMaterial = undefined;
		transparent = undefined;
		backgroundColor = backgroundFromTheme(
			settings.ui?.theme || '',
			nativeTheme.shouldUseDarkColors
		);
	}

	const win = new BrowserWindow({
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			height: 27,
			color: backgroundFromTheme(settings.ui?.theme || '', nativeTheme.shouldUseDarkColors),
			symbolColor: '#cacaca'
		},
		title: 'RelaGit',
		vibrancy,
		backgroundMaterial,
		transparent,
		backgroundColor,
		height: settings.window?.height || 600,
		width: settings.window?.width || 1000,
		minWidth: 500,
		minHeight: 500,
		x: settings.window?.x || undefined,
		y: settings.window?.y || undefined,
		show: false,
		webPreferences: {
			devTools: __NODE_ENV__ === 'development' || process.argv.includes('--devtools'),
			preload: path.resolve(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	win.once('ready-to-show', () => {
		win.show();
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

	win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));

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
					label: 'Blame View',
					accelerator: 'CmdOrCtrl+J',
					click: () => {
						dispatch(ipc.OPEN_BLAME);
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

app.on('open-url', (_, url) => {
	if (!mainWindow) return;

	mainWindow.focus();

	if (url.includes('oauth-captive')) {
		mainWindow.webContents.send(ipc.OAUTH_CAPTIVE, url);
	}
});
