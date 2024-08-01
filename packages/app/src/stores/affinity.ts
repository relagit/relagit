import { GenericStore } from '.';

import { Repository } from './repository';

type Affinity = {
	accessed: number;
	count: number;
};

const AffinityStore = new (class AffinityStore extends GenericStore {
	constructor() {
		super();
	}

	getAffinity(repository: Repository | string): Affinity {
		const key = `affinity_${typeof repository === 'string' ? repository : repository.id}`;

		return JSON.parse(localStorage.getItem(key) || '{}') as Affinity;
	}

	recordAccess(repository: Repository) {
		const key = `affinity_${repository.id}`;

		const value = this.getAffinity(repository);

		localStorage.setItem(
			key,
			JSON.stringify({
				accessed: Date.now(),
				count: (value.count || 0) + 1
			})
		);

		this.emit();
	}

	getWeight(repository: Repository) {
		const affinity = this.getAffinity(repository);

		if (affinity.accessed > Date.now() - 1000 * 60 * 60) {
			return affinity.count * 4;
		}

		if (affinity.accessed > Date.now() - 1000 * 60 * 60 * 24) {
			return affinity.count * 2;
		}

		if (affinity.accessed > Date.now() - 1000 * 60 * 60 * 24 * 7) {
			return affinity.count / 2;
		}

		return affinity.count / 4;
	}

	sort(a: Repository, b: Repository): number {
		return this.getWeight(b) || 0 - this.getWeight(a) || 0;
	}
})();

export default AffinityStore;
