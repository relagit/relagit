import { showReloadNotification } from '@app/ui/Settings/shared';
import { error } from '@modules/logger';
import { Repository } from '@stores/repository';
import { __EXTERNAL_PATH__ } from '@stores/settings';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');
const path = window.Native.DANGEROUS__NODE__REQUIRE('path');

export const getExternals = (): string[] => {
	const externals = JSON.parse(fs.readFileSync(__EXTERNAL_PATH__, 'utf-8')) as unknown[];

	if (!externals || !externals.length) return [];

	return externals as string[];
};

const resolveNodeModules = (): string => {
	const cwd = path.dirname(__EXTERNAL_PATH__);

	let i;

	const paths = cwd.split(path.sep);

	for (i = 0; i < paths.length; i++) {
		const current = paths.slice(0, paths.length - i).join(path.sep);

		if (fs.existsSync(path.join(current, 'pnpm-global'))) {
			const versions = fs.readdirSync(path.join(current, 'pnpm-global'));

			for (const version of versions) {
				if (fs.existsSync(path.join(current, 'pnpm-global', version, 'node_modules'))) {
					return path.join(current, 'pnpm-global', version, 'node_modules');
				}
			}
		}

		if (fs.existsSync(path.join(current, 'node_modules'))) {
			return path.join(current, 'node_modules');
		}
	}

	return '';
};

let node_modules = '';

export const getExternalWorkflows = (): {
	native?: string;
	plugin: string;
}[] => {
	if (!node_modules) {
		node_modules = resolveNodeModules();
	}

	const out = [];

	const externals = getExternals();

	for (const external of externals) {
		const dir = path.resolve(node_modules, external); // allows for relative/abs paths

		if (!fs.existsSync(dir)) continue;

		const files = fs.readdirSync(dir);

		if (files.includes('relagit.json')) {
			const relagit = JSON.parse(
				fs.readFileSync(path.join(dir, 'relagit.json'), 'utf-8')
			) as {
				native?: string;
				plugin: string;
			};

			if (relagit.native) {
				out.push({
					native: path.join(dir, relagit.native),
					plugin: path.join(dir, relagit.plugin)
				});
			} else {
				out.push({
					plugin: path.join(dir, relagit.plugin)
				});
			}

			continue;
		}

		if (files.includes('package.json')) {
			const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')) as {
				main?: string;
			};

			if (pkg.main) {
				out.push({
					plugin: path.join(dir, pkg.main)
				});
			}
		}
	}

	return out;
};

export const canUseRepositoryAsWorkflow = (repo: Repository): boolean | undefined => {
	if (!repo) return;

	return fs.existsSync(path.join(repo.path, 'relagit.json')); // we can assume the paths are correct
};

export const useRepositoryAsWorkflow = (repo: Repository): boolean => {
	try {
		if (!repo) return false;

		const external = JSON.parse(fs.readFileSync(__EXTERNAL_PATH__, 'utf-8')) as unknown[];

		if (!external || !Array.isArray(external)) return false;

		external.push(repo.path);

		fs.writeFileSync(__EXTERNAL_PATH__, JSON.stringify(external));

		showReloadNotification();

		return true;
	} catch (e) {
		error(e);
	}

	return false;
};
