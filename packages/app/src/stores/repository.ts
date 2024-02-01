import { GenericStore } from '.';

import { Fetch } from '@app/modules/git/fetch';
import { debug } from '@app/modules/logger';

import SettingsStore from './settings';

export interface Repository {
	draft?: boolean;
	id: string;
	path: string;
	name: string;
	remote: string;
	branch: string;
	commit: string;
	ahead: number;
	behind: number;
	lastFetched?: number;
}

const RepositoryStore = new (class RepositoryStore extends GenericStore {
	#record: Map<string, Repository> = new Map();

	constructor() {
		super();
	}

	get repositories() {
		return this.#record;
	}

	// we must have this in order to not emit many times on startup
	public _emit() {
		this.emit();
	}

	getById(id: string | undefined) {
		if (!id) return;

		return this.repositories.get(id);
	}

	getByPath(path: string) {
		return [...this.repositories.values()].find((f) => f.path === path);
	}

	attachListeners(path: string) {
		let fsTimeout: NodeJS.Timeout | null = null;

		window.Native.listeners.WATCHER.add(path, (_, changepath) => {
			if (fsTimeout) return;

			if (!changepath) return; // Ignore empty path

			if (changepath.includes('.git/index.lock')) return; // Ignore git files
			if (changepath.includes('.git/FETCH_HEAD')) return;

			debug('Filesystem change detected', changepath);

			window._refetchRepository(this.getByPath(path)!);

			fsTimeout = setTimeout(() => {
				fsTimeout = null;
			}, 5000);
		});
	}

	addRepository(repository: Repository) {
		this.repositories.set(repository.id, repository);
		this.emit();

		this.attachListeners(repository.path);
	}

	removeRepository(repository: Repository) {
		this.#record.delete(repository.id);

		this.emit();
	}

	updateRepository(id: string, replacement: Partial<Repository>) {
		this.#record.set(id, {
			...this.getById(id)!,
			...replacement
		});

		this.emit();
	}

	clearRepositories() {
		this.#record.clear();
		this.emit();
	}

	createDraft(path: string) {
		if (Array.from(this.#record.values()).some((r) => r.path === path)) return;

		const name = path.split('/').pop()!;

		const repository: Repository = {
			id: Math.random().toString(16).split('.')[1],
			path,
			name,
			remote: '',
			branch: '',
			commit: '',
			ahead: 0,
			behind: 0,
			draft: true,
			lastFetched: Date.now()
		};

		this.repositories.set(repository.id, repository);

		if (SettingsStore.settings.autoFetch) {
			this.makePermanent(repository);
		}
	}

	makePermanent(repository: Repository) {
		if (!repository.draft) return;

		Fetch(repository.path);

		this.#record.delete(repository.id); // we are explicitly NOT emitting here, as this will cause the repository to disappear from the UI

		window._getRepositoryStatus(repository.path, true, true, repository.id);
	}
})();

export default RepositoryStore;
