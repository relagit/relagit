import { GenericStore } from '.';

export interface IRepository {
	draft?: boolean;
	id: string;
	path: string;
	name: string;
	remote: string;
	branch: string;
	commit: string;
	aheadOrBehind: number;
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
		return this.repositories.find((f) => f.path === path);
	}

	addRepository(repository: IRepository) {
		this.repositories.push(repository);
		this.emit();
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
