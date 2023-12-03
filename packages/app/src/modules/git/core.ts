import { ExecException } from 'child_process';

import * as ipc from '~/common/ipc';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

export interface IGitParams {
	directory: string;
	command: string;
	args: string[];
	opts?: {
		encoding?: BufferEncoding;
	};
}

export const Git = async (params: IGitParams): Promise<string> => {
	const { directory, command, args } = params;

	let hasError: boolean | ExecException | string = false;

	if (!fs.existsSync(directory)) {
		throw new Error(`Directory does not exist: ${directory}`);
	}

	const opts = params.opts || {};

	const cmd = `git ${command} ${args.join(' ')}`;

	const result: string = await new Promise(async (resolve, reject) => {
		const { error, stdout, stderr } = await ipcRenderer.invoke(ipc.GIT_EXEC, cmd, {
			cwd: directory,
			maxBuffer: Infinity,
			encoding: opts?.encoding || 'utf8'
		});

		if (error) {
			hasError = error;
			reject(error);
		} else if (stderr) {
			if (
				!(cmd.startsWith('git push ') && stderr.startsWith('To ')) &&
				!stderr.startsWith('Everything up-to-date') &&
				!(cmd.startsWith('git clone ') && stderr.startsWith('Cloning into')) &&
				!(cmd.startsWith('git checkout ') && stderr.startsWith('Switched to branch')) &&
				!(cmd.startsWith('git push ') && stderr.includes('pull request for '))
			) {
				hasError = stderr;
				reject(stderr);
			} else {
				resolve(stderr.trim());
			}
		} else {
			resolve(stdout?.hasOwnProperty('trim') ? stdout.trim() : stdout);
		}
	});

	if (hasError) {
		throw hasError;
	}

	return result;
};
