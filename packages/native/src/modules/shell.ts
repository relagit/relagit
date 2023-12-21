/**
 * Modified from GitHub Desktop. (MIT License)
 * https://github.com/desktop/desktop/blob/development/app/src/lib/shell.ts
 */
import child_process, { ExecFileOptions } from 'child_process';
import { promisify } from 'util';

import { error } from './logger';

const execFile = promisify(child_process.execFile);

const ExcludedEnvironmentVars = new Set(['LOCAL_GIT_DIRECTORY']);

// https://github.com/desktop/desktop/blob/development/app/src/lib/shell.ts#L37
export async function updateEnvironmentForProcess(): Promise<void> {
	if (process.platform !== 'darwin') {
		return;
	}

	const shell = process?.env?.SHELL || '/bin/bash';

	// These options are leftovers of previous implementations and could
	// _probably_ be removed. The default maxBuffer is 1Mb and I don't know why
	// anyone would have 1Mb of env vars (previous implementation had no limit).
	//
	// The timeout is a leftover from when the process was detached and the reason
	// we still have it is that if we happen to await this method it could block
	// app launch
	const opts: ExecFileOptions = { timeout: 5000, maxBuffer: 10 * 1024 * 1024 };

	// Deal with environment variables containing newlines by separating with \0
	// https://github.com/atom/atom/blob/d04abd683/src/update-process-env.js#L17
	const cmd = 'command awk \'BEGIN{for(k in ENVIRON) printf("%c%s=%s%c", 0, k, ENVIRON[k], 0)}\'';

	try {
		const { stdout } = await execFile(shell, ['-ilc', cmd], opts);

		for (const [, k, v] of stdout.matchAll(/\0(.+?)=(.+?)\0/g)) {
			if (!ExcludedEnvironmentVars.has(k)) {
				process.env[k] = v;
			}
		}
	} catch (err) {
		error('Failed updating process environment from shell');
	}
}
