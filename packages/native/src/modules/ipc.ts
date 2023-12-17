import { BrowserWindow, OpenDialogOptions, app, dialog, ipcMain, shell } from 'electron';

import child_process from 'child_process';

import * as ipc from '~/common/ipc';

const preloadPathEnv = () => {
	try {
		const command = process.platform === 'win32' ? 'PATH' : 'echo $PATH';

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

	win.webContents.on('will-navigate', (e, url) => {
		e.preventDefault();

		shell.openExternal(url);
	});

	ipcMain.handle(ipc.OPEN_FILE_DIALOG, async (_, options: OpenDialogOptions) => {
		return await dialog.showOpenDialog(win, options);
	});

	ipcMain.handle(
		ipc.ALERT,
		(_, message: string, type: 'none' | 'info' | 'error' | 'question' | 'warning') => {
			dialog.showMessageBox(win, {
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
			const command = process.platform === 'win32' ? 'where' : 'command -v';

			child_process.execSync(`${command} ${bin}`);

			return true;
		} catch (error) {
			return false;
		}
	});

	ipcMain.handle(ipc.SPAWN_ENV, (_, exec: string, path: string) => {
		child_process.spawn(exec, [path], {
			detached: true,
			env: preloadPathEnv()
		});
	});

	ipcMain.handle(ipc.BASE64_FROM_BINARY, (_, data: string) => {
		return Buffer.from(data, 'binary').toString('base64');
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
			const out = {
				error: null,
				stdout: null,
				stderr: null
			};

			return new Promise((resolve) => {
				const process = child_process.exec(cmd, opts, (error, stdout, stderr) => {
					if (opts.encoding) {
						process.stdout?.setEncoding?.(opts.encoding);
					}

					out.error = error;
					out.stdout = stdout;
					out.stderr = stderr;

					resolve(out);
				});
			});
		}
	);
};

export const dispatch = (channel: string, ...args: unknown[]) => {
	return win.webContents.send(channel, ...args);
};
