import def from '@content/modules/actions/def.d.ts';

import { type IconName } from '@app/ui/Common/Icon';
import * as Git from '@modules/git';
import LocationStore from '@stores/location';
import RepositoryStore, { type Repository } from '@stores/repository';

import pkj from '../../../../../package.json' assert { type: 'json' };
import { error } from '../logger';

const sucrase = window.Native.DANGEROUS__NODE__REQUIRE('sucrase');
const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os');

type action =
	| 'all'
	| 'commit'
	| 'pull'
	| 'push'
	| 'repository_add'
	| 'repository_remove'
	| 'remote_fetch'
	| 'settings_update'
	| 'stash'
	| 'stash_pop';

const defFile = def.replace('{{VERSION}}', pkj.version);

export const iconFromAction = (act: action | action[]): IconName => {
	switch (Array.isArray(act) ? act[0] : act) {
		case 'all':
			return 'key-asterisk';
		case 'commit':
			return 'git-commit';
		case 'push':
			return 'arrow-up';
		case 'pull':
			return 'arrow-down';
		case 'repository_add':
			return 'plus';
		case 'repository_remove':
			return 'trash';
		case 'settings_update':
			return 'gear';
		case 'remote_fetch':
			return 'cloud';
		case 'stash':
			return 'archive';
		case 'stash_pop':
			return 'archive';
		default:
			return 'circle';
	}
};

export interface Workflow {
	filename: string;
	name: string;
	description?: string;
	hooks?: {
		[K in action]?: (
			event: K | action,
			...params: ParamsFromEventType<K>
		) => Promise<void> | void;
	};
}

export interface Theme {
	name: string;
	description?: string;
	accent?: string;
	main: string;
	authors: {
		name: string;
		url: string;
	}[];
}

export const __RELAGIT_PATH__ = path.join(os.homedir(), '.relagit');
export const __WORKFLOWS_PATH__ = path.join(os.homedir(), '.relagit', 'workflows');

if (!fs.existsSync(__RELAGIT_PATH__)) {
	fs.mkdirSync(__RELAGIT_PATH__);
}

if (
	!fs.existsSync(path.join(__RELAGIT_PATH__, 'index.d.ts')) ||
	defFile !== fs.readFileSync(path.join(__RELAGIT_PATH__, 'index.d.ts'), 'utf8')
) {
	fs.promises.writeFile(path.join(__RELAGIT_PATH__, 'index.d.ts'), defFile);
}

export const extnames = (str: string) => {
	const extenstions = str.split('.');
	extenstions.shift();

	return `${extenstions.join('.')}`;
};

export const require = (id: string) => {
	if (id.startsWith('relagit')) {
		const submodule = id.split(':')[1];

		switch (submodule) {
			case 'themes':
				return {
					Theme: class _Theme {
						name: string;
						description?: string;
						accent?: string;
						main: string;
						authors: {
							name: string;
							url: string;
						}[];

						constructor(options: Theme) {
							this.name = options.name;
							this.description = options.description;
							this.accent = options.accent;
							this.main = options.main;
							this.authors = options.authors;
						}
					}
				};
			case 'actions':
				return {
					Workflow: class _Workflow {
						name: string;
						description?: string;
						hooks?: {
							[K in action]?: (
								event: K,
								...params: ParamsFromEventType<K>
							) => Promise<void> | void;
						};

						constructor(options: Workflow) {
							this.name = options.name;
							this.description = options.description;
							this.hooks = options.hooks;
						}
					},
					context: getContext
				};
			case 'client':
				return {};
		}

		return null;
	}
};

export const loadWorkflows = async () => {
	if (!fs.existsSync(__WORKFLOWS_PATH__)) {
		fs.mkdirSync(__WORKFLOWS_PATH__);
	}

	let _workflows = fs.readdirSync(__WORKFLOWS_PATH__);

	_workflows = _workflows.filter(
		(workflow) => ['ts', 'js'].includes(extnames(workflow)) && !workflow.endsWith('.d.ts')
	);

	for (const workflowPath of _workflows) {
		try {
			const data = await fs.promises.readFile(
				path.join(__WORKFLOWS_PATH__, workflowPath),
				'utf8'
			);

			const fn = new Function(
				'require',
				'exports',
				'module',
				'console',
				sucrase.transform(data, {
					transforms: ['typescript', 'imports']
				}).code + '\n\nreturn module.exports || exports.default || exports || null;'
			);

			const workflow = fn(require, {}, {}, makeConsole(path.basename(workflowPath)));

			workflows.add({ ...workflow, filename: workflowPath });
		} catch (e) {
			error('Failed to load workflow', e);
		}
	}
};

export const workflows = new Set<Workflow>();

type ParamsFromEventType<E extends action> = E extends 'commit'
	? [Repository, { message: string; description: string }]
	: E extends 'push'
		? [Repository]
		: E extends 'pull'
			? [Repository]
			: E extends 'remote_fetch'
				? [Repository, { name: string; url: string; type: string }[]]
				: E extends 'repository_add'
					? [string]
					: E extends 'repository_remove'
						? [string]
						: E extends 'settings_update'
							? []
							: E extends 'stash'
								? [Repository]
								: E extends 'stash_pop'
									? [Repository]
									: E extends 'all'
										? unknown[]
										: [Repository];

export const triggerWorkflow = async <E extends action>(
	event: E,
	...params: ParamsFromEventType<E>
) => {
	for (const workflow of workflows) {
		if (workflow.hooks?.[event]) {
			try {
				await workflow.hooks[event]!(event, ...params);
			} catch (e) {
				error(`Failed to trigger workflow "${workflow.name}"`, e);
			}
		}

		if (workflow.hooks?.all) {
			try {
				await workflow.hooks.all(event, ...params);
			} catch (e) {
				error(`Failed to trigger workflow "${workflow.name}"`, e);
			}
		}
	}
};

window._triggerWorkflow = triggerWorkflow;

const makeContext = (location: string | undefined) => {
	if (!location) return null;

	const context = {
		Git,
		Repository: {
			path: location,
			...(RepositoryStore.getByPath(location) ?? {})
		}
	};

	return context;
};

export const getContext = () => {
	return makeContext(LocationStore.selectedRepository?.path);
};

export const makeConsole = (prefix: string) => {
	return {
		log: (...args: unknown[]) => {
			console.log(`%c[${prefix}]`, 'color: #7AA2F7', ...args);
		},
		info: (...args: unknown[]) => {
			console.log(`%c[${prefix}]`, 'color: #7AA2F7', ...args);
		},
		warn: (...args: unknown[]) => {
			console.log(`%c[${prefix}]`, 'color: #e5c062', ...args);
		},
		error: (...args: unknown[]) => {
			console.log(`%c[${prefix}]`, 'color: #e56269', ...args);
		}
	};
};
