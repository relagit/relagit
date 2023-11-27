import { triggerWorkflow } from '@app/modules/actions';
import { IRepository } from '@app/stores/repository';

import { Native as _Native } from '../native/src/preload';

declare global {
	interface Window {
		Stores: {
			[key: string]: unknown;
		};
		Managers: {
			[key: string]: unknown;
		};
		Native: typeof _Native;

		_refetchRepository: (repo: IRepository, transitionTo?: boolean) => Promise<void>;
		_triggerWorkflow: typeof triggerWorkflow;
	}

	export const __NODE_ENV__: 'development' | 'production' | 'test';
	export const __COMMIT_HASH__: string;
}
