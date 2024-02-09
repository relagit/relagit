import def from '@content/modules/actions/def.d.ts';
import { createRoot } from 'solid-js';

import NotificationStore from '@app/stores/notification';
import { type IconName } from '@app/ui/Common/Icon';
import Notification, { NotificationProps } from '@app/ui/Notification';
import * as Git from '@modules/git';
import LocationStore from '@stores/location';
import RepositoryStore, { type Repository } from '@stores/repository';

import pkj from '../../../../../package.json' assert { type: 'json' };
import { error } from '../logger';
import { getExternalWorkflows } from './external';

const sucrase = window.Native.DANGEROUS__NODE__REQUIRE('sucrase');
const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os');

type action =
	| 'navigate'
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
		case 'navigate':
			return 'arrow-right';
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
					context: getContext,
					notifications: {
						show: (id: string, props: NotificationProps) => {
							NotificationStore.add(
								id,
								createRoot(() => <Notification {...props} id={id} />)
							);
						},
						hide: (id: string) => {
							NotificationStore.remove(id);
						}
					}
				};
			case 'client':
				return {};
		}

		return null;
	}

	return window.Native.DANGEROUS__NODE__REQUIRE(id);
};

export const loadWorkflows = async () => {
	if (!fs.existsSync(__WORKFLOWS_PATH__)) {
		fs.mkdirSync(__WORKFLOWS_PATH__);
	}
	const externalWorkflows = getExternalWorkflows();

	const _workflows: {
		native?: string;
		plugin: string;
	}[] = externalWorkflows;

	const files = await fs.promises.readdir(__WORKFLOWS_PATH__);

	for (const file of files) {
		if (file.endsWith('.d.ts')) continue;
		if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

		if (_workflows.find((workflow) => workflow.plugin === file || workflow.native === file))
			continue;

		if (file.includes('.native.')) {
			if (files.includes(file.replace('.native.', '.'))) {
				_workflows.push({
					native: file,
					plugin: file.replace('.native.', '.')
				});
			}
		} else {
			if (files.includes(file.replace('.', '.native.'))) {
				_workflows.push({
					native: file.replace('.', '.native.'),
					plugin: file
				});
			}

			_workflows.push({
				plugin: file
			});
		}
	}

	for (const workflow of _workflows) {
		try {
			const data = await fs.promises.readFile(
				path.resolve(__WORKFLOWS_PATH__, workflow.plugin),
				'utf8'
			);

			let nativeValue = '';

			if (workflow.native) {
				nativeValue = await window.Native.listeners.LOAD_NATIVE_SCRIPT(
					sucrase
						.transform(
							await fs.promises.readFile(
								path.resolve(__WORKFLOWS_PATH__, workflow.native),
								'utf8'
							),
							{
								transforms: ['typescript', 'imports']
							}
						)
						.code.replaceAll(');, ', '); ') + // wtf sucrase
						'\n\nreturn exports.default || Object.keys(exports).length ? exports : module.exports || null;',
					workflow.native
				);
			}

			const fn = new Function(
				'require',
				'exports',
				'module',
				'console',
				'native',
				sucrase
					.transform(data, {
						transforms: ['typescript', 'imports']
					})
					.code.replaceAll(');, ', '); ') + // wtf sucrase
					'\n\nreturn exports.default || Object.keys(exports).length ? exports : module.exports || null;'
			);

			const res = fn(
				require,
				{},
				{},
				makeConsole(path.basename(workflow.plugin)),
				window[nativeValue as keyof typeof window] // only way to pass functions around
			);

			workflows.add({ ...(res.default || res), filename: workflow.plugin });
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
			: E extends 'navigate'
				? [Repository | undefined, GitFile | undefined]
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
