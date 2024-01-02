import { showCloneModal } from './ui/Modal/CloneModal';
import { showInformationModal } from './ui/Modal/InformationModal';
import { showRepoModal } from './ui/Modal/RepositoryModal';

export const registerAccelorators = () => {
	window.Native.listeners.INFORMATION(() => {
		showInformationModal();
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
