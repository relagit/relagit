import { Buf, Repository } from 'nodegit';
import { Native as _Native } from '~/main/src/preload';

import { getRepositoryStatus, refetchRepository, triggerWorkflow } from '@app/modules/actions';
import { showErrorModal } from '@app/ui/Modal';

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
	export const __GITLAB_CLIENT_ID__: string | undefined;
	export const __CODEBERG_CLIENT_ID__: string | undefined;
	export const __AI_API_PASSWORD__: string;
	export const __AI_API_URL__: string;
	export const __COMMIT_HASH__: string;
}

// modify the 'nodegit' branch export types to include a method called upstreamName
declare module 'nodegit' {
	export namespace Branch {
		function upstreamName(repository: Repository, refName: string): Promise<Buf>;
	}
}
