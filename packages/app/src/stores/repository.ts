import { GenericStore } from '.';

import { debug } from '@app/modules/logger';

import LocationStore from './location';

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

const RepositoryStore = new (class extends GenericStore {
	#record: Map<string, Repository> = new Map();

	constructor() {
		super();
	}

	get repositories() {
		return this.#record;
	}

	getById(id: string) {
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

			window._refetchRepository(this.getByPath(path));

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
			...this.getById(id),
			...replacement
		});

		this.emit();
		LocationStore.emit();
	}

	clearRepositories() {
		this.#record.clear();
		this.emit();
	}
})();

export default RepositoryStore;
