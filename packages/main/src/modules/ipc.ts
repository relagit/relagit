import {
	BrowserWindow,
	OpenDialogOptions,
	app,
	dialog,
	ipcMain,
	nativeImage,
	nativeTheme,
	safeStorage,
	shell
} from 'electron';
import * as ipc from '~/shared/ipc';

import child_process from 'child_process';

import appPath from 'app-path';

const beforeQuitController = new AbortController();

app.on('before-quit', () => {
	beforeQuitController.abort();
});

const preloadPathEnv = () => {
	try {
		const command = process.platform === 'win32' ? 'echo %PATH%' : 'echo $PATH';

		const path = child_process.execSync(command).toString().trim();

		return Object.assign(process.env, { PATH: path });
	} catch (error) {
		return process.env;
	}
};

let win: BrowserWindow | null = null;

export default (window: BrowserWindow) => {
	if (win) return (win = window);

	win = window;

	if (!win) return;

	win.webContents.on('will-navigate', (e, url) => {
		e.preventDefault();

		shell.openExternal(url);
	});

	nativeTheme.on('updated', () => {
		dispatch(ipc.THEME_UPDATED);
	});

	ipcMain.handle(ipc.OPEN_FILE_DIALOG, async (_, options: OpenDialogOptions) => {
		return await dialog.showOpenDialog(win!, options);
	});

	ipcMain.handle(ipc.GET_THUMBNAIL, async (_, bundleid: string | string[]) => {
		if (process.platform !== 'darwin') return null;

		try {
			if (Array.isArray(bundleid)) {
				for (const id of bundleid) {
					try {
						const path = await appPath(id);

						const img = await nativeImage.createThumbnailFromPath(path, {
							width: 256,
							height: 256
						});

						return img.toDataURL();
					} catch (error) {
						continue;
					}
				}

				return null;
			}

			const path = await appPath(bundleid);

			const img = await nativeImage.createThumbnailFromPath(path, {
				width: 256,
				height: 256
			});

			return img.toDataURL();
		} catch (error) {
			return null;
		}
	});

	ipcMain.handle(
		ipc.ALERT,
		(_, message: string, type: 'none' | 'info' | 'error' | 'question' | 'warning') => {
			dialog.showMessageBox(win!, {
				type,
				message
			});
		}
	);

	ipcMain.handle(ipc.SHOW_ITEM_IN_FOLDER, (_, path: string) => {
		return shell.showItemInFolder(path);
	});

	ipcMain.handle(ipc.RELOAD_CLIENT, () => {
		app.relaunch();
		app.exit();
	});

	ipcMain.handle(ipc.CHECK_IS_IN_PATH, (_, bin: string) => {
		try {
			const command = process.platform === 'win32' ? 'where.exe' : 'which';

			const path = child_process.execSync(`${command} ${bin}`, {
				env: preloadPathEnv()
			});

			return new TextDecoder().decode(path);
		} catch (error) {
			return false;
		}
	});

	ipcMain.handle(ipc.SPAWN_ENV, (_, exec: string, path: string) => {
		const parts = exec.split(' ');
		const command = parts.shift()!;

		child_process.spawn(command, [...parts, path], {
			detached: true,
			env: preloadPathEnv()
		});
	});

	ipcMain.handle(ipc.DISK_SIZE, (_, path: string) => {
		if (!path) return;

		if (path.includes('../')) return;

		return child_process.execSync(`du -sh "${path}"`).toString().trim();
	});

	ipcMain.handle(ipc.BASE64_FROM_BINARY, (_, data: string) => {
		return Buffer.from(data, 'binary').toString('base64');
	});

	ipcMain.handle(ipc.GET_ENCRYPTED, (_, data: string) => {
		if (safeStorage.isEncryptionAvailable()) {
			return safeStorage.encryptString(data).toString('hex');
		}

		return Buffer.from(data, 'utf8').toString('base64');
	});

	ipcMain.handle(ipc.GET_DECRYPTED, (_, data: string) => {
		if (safeStorage.isEncryptionAvailable()) {
			return safeStorage.decryptString(Buffer.from(data, 'hex'));
		}

		return Buffer.from(data, 'base64').toString('utf8');
	});

	ipcMain.handle(
		ipc.GIT_EXEC,
		(
			_,
			cmd,
			opts: {
				encoding?: 'binary';
			} & child_process.ExecOptions
		) => {
			const out: {
				error: child_process.ExecException | null;
				stdout: string | null;
				stderr: string | null;
			} = {
				error: null,
				stdout: null,
				stderr: null
			};

			return new Promise((resolve) => {
				const proc = child_process.exec(
					cmd,
					{
						...opts,
						env: {
							...process.env,
							...opts.env
						},
						signal: beforeQuitController.signal
					},
					(error, stdout, stderr) => {
						if (opts.encoding) {
							proc.stdout?.setEncoding?.(opts.encoding);
						}

						out.error = error;
						out.stdout = stdout;
						out.stderr = stderr;

						resolve(out);
					}
				);
			});
		}
	);
};

export const dispatch = (channel: string, ...args: unknown[]) => {
	return win?.webContents.send(channel, ...args);
};
