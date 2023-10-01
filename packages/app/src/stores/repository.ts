import { GenericStore } from '.';

export interface IRepository {
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

const RepositoryStore = new (class Repository extends GenericStore {
	#record: IRepository[] = [];

	constructor() {
		super();
	}

	get repositories() {
		return this.#record;
	}

	getByName(name: string) {
		return this.repositories.find((f) => f.name === name);
	}

	getByPath(path: string) {
		return this.repositories.find((f) => f?.path === path);
	}

	attachListeners(path: string) {
		let fsTimeout: NodeJS.Timeout | null = null;

		window.Native.listeners.WATCHER.add(path, (_, changepath) => {
			if (fsTimeout) return;

			if (!changepath) return; // Ignore empty path

			if (changepath.includes('.git/index.lock')) return; // Ignore git files

			window._refetchRepository(this.getByPath(path));

			fsTimeout = setTimeout(() => {
				fsTimeout = null;
			}, 5000);
		});
	}

	addRepository(repository: IRepository) {
		this.repositories.push(repository);
		this.emit();

		this.attachListeners(repository.path);
	}

	removeRepository(repository: IRepository) {
		this.#record = this.repositories.filter((f) => {
			return f.id !== repository.id;
		});
		this.emit();
	}

	updateRepository(repository: IRepository) {
		this.#record = this.repositories.map((f) => {
			if (f.id === repository.id) {
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

export default RepositoryStore;
