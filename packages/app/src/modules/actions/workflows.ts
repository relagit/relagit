import def from '@content/modules/actions/def.d.ts';

import { IconName } from '@app/ui/Common/Icon';
import * as Git from '@modules/git';
import LocationStore from '@stores/location';
import RepositoryStore from '@stores/repository';

import pkj from '../../../../../package.json' assert { type: 'json' };
import { error } from '../logger';

const sucrase = window.Native.DANGEROUS__NODE__REQUIRE('sucrase') as typeof import('sucrase');
const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os') as typeof import('os');

type action =
	| '*'
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
		case '*':
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
	on: action | action[];
	name: string;
	description?: string;
	steps: {
		name?: string;
		run: (event: action, ...params: unknown[]) => Promise<void> | void;
	}[];
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

if (!fs.existsSync(path.join(__RELAGIT_PATH__, 'index.d.ts'))) {
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
					Theme: class CTheme {
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
					Workflow: class CWorkflow {
						on: action | action[];
						name: string;
						description?: string;
						steps: {
							name?: string;
							run: (event: action) => Promise<void> | void;
						}[];

						constructor(options: Workflow) {
							this.on = options.on;
							this.name = options.name;
							this.description = options.description;
							this.steps = options.steps;
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
	? [IRepository, { message: string; description: string }]
	: E extends 'push'
	  ? [IRepository]
	  : E extends 'pull'
	    ? [IRepository]
	    : E extends 'remote_fetch'
	      ? [IRepository, { name: string; url: string; type: string }[]]
	      : E extends 'repository_add'
	        ? [string]
	        : E extends 'repository_remove'
	          ? [string]
	          : E extends 'settings_update'
	            ? []
	            : E extends 'stash'
	              ? [IRepository]
	              : E extends 'stash_pop'
	                ? [IRepository]
	                : [];

export const triggerWorkflow = async <E extends action>(
	event: E,
	...params: ParamsFromEventType<E>
) => {
	for (const workflow of workflows) {
		if (Array.isArray(workflow.on)) {
			if (workflow.on.includes(event) || workflow.on.includes('*')) {
				for (const step of workflow.steps) {
					await step.run(event, ...params);
				}
			}
		} else {
			if (workflow.on === event || workflow.on === '*') {
				for (const step of workflow.steps) {
					await step.run(event, ...params);
				}
			}
		}
	}
};

const makeContext = (location: string) => {
	const context = {
		Git: {
			Push: async (repository: IRepository) => {
				await Git.Push(repository);

				triggerWorkflow('push', repository);
			},
			Commit: async (repository: IRepository, message: string, description: string) => {
				await Git.Commit(repository, message, description);

				triggerWorkflow('commit', repository, {
					message,
					description
				});
			}
		},
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
