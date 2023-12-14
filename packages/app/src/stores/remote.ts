import { GenericStore } from '.';

import { Repository } from './repository';

export interface RemoteRepository {
	repository: Repository;
	name: string;
	url: string;
	type: 'fetch' | 'push';
}
const RemoteStore = new (class extends GenericStore {
	#record: RemoteRepository[] = [];
	constructor() {
		super();
	}

	get remotes() {
		return this.#record;
	}

	getByRepoName(name: string) {
		return this.remotes.filter((f) => f.repository?.name === name);
	}

	getByRepoPath(path: string) {
		return this.remotes.filter((f) => f.repository?.path === path);
	}

	getByType(type: 'fetch' | 'push') {
		return this.remotes.filter((f) => f.type === type);
	}

	removeByRepoPath(path: string) {
		if (!this.remotes.some((f) => f.repository?.path === path)) return;

		this.#record = this.remotes.filter((f) => f.repository?.path !== path);
		this.emit();
	}

	addRemote(repository: RemoteRepository) {
		this.remotes.push(repository);
		this.emit();
	}

	removeRemote(repository: RemoteRepository) {
		this.#record = this.remotes.filter((f) => f.repository?.id !== repository.repository.id);
		this.emit();
	}

	updateRemote(repository: RemoteRepository) {
		this.#record = this.remotes.map((f) => {
			if (f.repository?.id === repository.repository.id) {
				return repository;
			}
			return f;
		});

		this.emit();
	}

	clearRepositories() {
		this.#record = [];
		this.emit();
	}
})();

export default RemoteStore;
