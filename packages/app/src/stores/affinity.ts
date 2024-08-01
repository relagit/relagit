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

	recordAccess(repository: Repository | string) {
		const key = `affinity_${typeof repository === 'string' ? repository : repository.id}`;

		const value = this.getAffinity(repository);

		localStorage.setItem(
			key,
			JSON.stringify({
				accessed: Date.now(),
				count: value.count + 1
			})
		);

		this.emit();
	}

	sort(a: Repository, b: Repository): number {
		const aAffinity = this.getAffinity(a);
		const bAffinity = this.getAffinity(b);

		if (aAffinity.accessed > Date.now() - 1000 * 60 * 60) {
			return bAffinity.accessed > Date.now() - 1000 * 60 * 60 ?
					bAffinity.count - aAffinity.count
				:	-1;
		}

		if (aAffinity.accessed > Date.now() - 1000 * 60 * 60 * 24) {
			return bAffinity.accessed > Date.now() - 1000 * 60 * 60 * 24 ?
					bAffinity.count - aAffinity.count
				:	-1;
		}

		if (aAffinity.accessed > Date.now() - 1000 * 60 * 60 * 24 * 7) {
			return bAffinity.accessed > Date.now() - 1000 * 60 * 60 * 24 * 7 ?
					aAffinity.count - bAffinity.count
				:	-1;
		}

		return bAffinity.count - aAffinity.count;
	}
})();

export default AffinityStore;
