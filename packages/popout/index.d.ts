import { refetchRepository, triggerWorkflow } from '@app/modules/actions';
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
		_showErrorModal: typeof showErrorModal;
		_triggerWorkflow: typeof triggerWorkflow;
	}
}
