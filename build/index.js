import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = process.cwd();

const GITHUB_TOKEN = process.argv[2].replace('--token=', '');

const platform = () => {
	switch (process.platform) {
		case 'darwin':
			return 'mac';
		case 'win32':
			return 'win';
		case 'linux':
			return 'linux';
		default:
			throw new Error('Unknown platform');
	}
};

const run = () => {
	console.log('checking if node_modules exists');
	if (!fs.existsSync(path.resolve(__dirname, 'node_modules'))) {
		console.log("it doesn't! installing now...");
		child_process.execSync('pnpm i --frozen-lockfile', {
			cwd: __dirname
		});
	} else {
		console.log('it does!');
	}

	console.log('building...');
	child_process.execSync('pnpm build', {
		cwd: __dirname
	});

	console.log('making...');
	child_process.execSync(`pnpm make:${platform()} --publish always`, {
		cwd: __dirname,
		env: {
			GH_TOKEN: GITHUB_TOKEN
		}
	});
};

run();
