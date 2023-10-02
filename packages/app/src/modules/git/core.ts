import { ExecException } from 'child_process';

const child_process = window.Native.DANGEROUS__NODE__REQUIRE(
	'child_process'
) as typeof import('child_process');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

export interface IGitParams {
	directory: string;
	command: string;
	args: string[];
}

export const Git = async (params: IGitParams): Promise<string> => {
	const { directory, command, args } = params;

	let hasError: boolean | ExecException | string = false;

	if (!fs.existsSync(directory)) {
		throw new Error(`Directory does not exist: ${directory}`);
	}

	const cmd = `git ${command} ${args.join(' ')}`;

	const result: string = await new Promise((resolve, reject) => {
		child_process.exec(cmd, { cwd: directory }, (error, stdout, stderr) => {
			if (error) {
				hasError = error;
				reject(error);
			} else if (stderr) {
				if (!(cmd.startsWith('git push ') && stderr.startsWith('To '))) {
					hasError = stderr;
					reject(stderr);
				} else {
					resolve(stderr.trim());
				}
			} else {
				resolve(stdout.trim());
			}
		});
	});

	if (hasError) {
		throw hasError;
	}

	return result;
};
