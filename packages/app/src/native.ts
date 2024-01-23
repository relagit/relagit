import { showCloneModal } from './ui/Modal/CloneModal';
import { showInformationModal } from './ui/Modal/InformationModal';
import { showRepoModal } from './ui/Modal/RepositoryModal';
import { showSettingsModal } from './ui/Settings';

import { workflows } from './modules/actions/workflows';

export const registerAccelerators = () => {
	window.Native.listeners.LOAD_WORKFLOW((_, wf) => {
		workflows.add(wf);
	});

	window.Native.listeners.INFORMATION(() => {
		showInformationModal();
	});

	window.Native.listeners.SETTINGS(() => {
		showSettingsModal();
	});

	window.Native.listeners.CREATE(() => {
		showRepoModal('create');
	});

	window.Native.listeners.ADD(() => {
		showRepoModal('add');
	});

	window.Native.listeners.CLONE(() => {
		showCloneModal();
	});
};
