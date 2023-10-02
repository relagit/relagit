import { debug } from '@app/modules/logger';
import LocationStore from './location';
import SettingsStore from './settings';
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
	#record: Map<string, IRepository> = new Map();

	constructor() {
		super();

		setTimeout(() => {
			if (SettingsStore.getSetting('activeRepository')) {
				const repo = RepositoryStore.getByPath(
					SettingsStore.getSetting('activeRepository') as string
				);

				if (repo) {
					LocationStore.setSelectedRepository(repo, false);
				}
			}
		}, 1000); // 1s timeout is GENERALLY enough for the repository to be loaded, if it's not, it's not a big deal
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

	addRepository(repository: IRepository) {
		this.repositories.set(repository.id, repository);
		this.emit();

		this.attachListeners(repository.path);
	}

	removeRepository(repository: IRepository) {
		this.#record.delete(repository.id);

		this.emit();
	}

	updateRepository(id: string, replacement: Partial<IRepository>) {
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
