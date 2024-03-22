import { showCloneModal } from './ui/Modal/CloneModal';
import { showInformationModal } from './ui/Modal/InformationModal';
import { showLogModal } from './ui/Modal/LogModal';
import { showRepoModal } from './ui/Modal/RepositoryModal';
import { showSettingsModal } from './ui/Settings';

import { workflows } from './modules/actions/workflows';
import { openInEditor } from './modules/editor';
import { openExternal, showItemInFolder } from './modules/shell';
import LocationStore from './stores/location';

export const registerAccelerators = () => {
	window.Native.listeners.OPEN_REMOTE(() => {
		const url = LocationStore.selectedRepository?.remote;

		if (url) openExternal(url);
	});

	window.Native.listeners.SHOW_IN_FOLDER(() => {
		const path = LocationStore.selectedRepository?.path;

		if (path) showItemInFolder(path);
	});

	window.Native.listeners.OPEN_EDITOR(() => {
		const path = LocationStore.selectedRepository?.path;

		if (path) openInEditor(path);
	});

	window.Native.listeners.LOAD_WORKFLOW((_, wf) => {
		workflows.add(wf);
	});

	window.Native.listeners.INFORMATION(() => {
		showInformationModal();
	});

	window.Native.listeners.LOG(() => {
		showLogModal();
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
