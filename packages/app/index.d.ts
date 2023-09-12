import { Native as _Native } from '../native/src/preload';
import { IRepository } from '@app/stores/repository';

declare global {
	interface Window {
		Stores: {
			[key: string]: unknown;
		};
		Managers: {
			[key: string]: unknown;
		};
		Native: typeof _Native;

		_refetchRepository: (repo: IRepository) => Promise<void>;
	}

	export const __NODE_ENV__: 'development' | 'production' | 'test';
	export const __COMMIT_HASH__: string;
}
