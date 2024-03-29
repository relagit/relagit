import { getRepositoryStatus, refetchRepository, triggerWorkflow } from '@app/modules/actions';
import { showErrorModal } from '@app/ui/Modal';

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

		_refetchRepository: typeof refetchRepository;
		_getRepositoryStatus: typeof getRepositoryStatus;
		_showErrorModal: typeof showErrorModal;
		_triggerWorkflow: typeof triggerWorkflow;
	}

	export const __NODE_ENV__: 'development' | 'production' | 'test';
	export const __GITHUB_CLIENT_ID__: string | undefined;
	export const __AI_API_PASSWORD__: string;
	export const __AI_API_URL__: string;
	export const __COMMIT_HASH__: string;
}
