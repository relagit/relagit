import { GenericStore } from '.';

import { LogCommit } from '@app/modules/git/log';
import { PastCommit } from '@app/modules/git/show';

import FileStore, { GitFile } from './files';
import type { Repository } from './repository';
import RepositoryStore from './repository';
import SettingsStore, { __SETTINGS_PATH__ } from './settings';

const LocationStore = new (class LocationStore extends GenericStore {
	#selectedFile: GitFile | undefined = undefined;
	#selectedRepository: Repository | undefined = undefined;
	#historyOpen = false;
	#selectedCommit: LogCommit | undefined = undefined;
	#selectedCommitFiles: PastCommit | undefined = undefined;
	#selectedCommitFile: PastCommit['files'][number] | undefined = undefined;
	#showingPalette = false;
	#imageDisplayMode: 'sidebyside' | 'difference' = 'sidebyside';

	#isRefetchingSelectedRepository = false;

	#dragState: DragEvent | null = null;

	constructor() {
		super();

		window.Native.listeners.HISTORY((_, value) => {
			this.#historyOpen = value ?? !this.#historyOpen;
			this.emit();
		});

		window.Native.listeners.WATCHER.add(__SETTINGS_PATH__, () => {
			if (SettingsStore.getSetting('activeRepository') !== this.selectedRepository?.path) {
				this.setSelectedRepository(
					RepositoryStore.getByPath(SettingsStore.getSetting('activeRepository') ?? '')
				);
			}
		});
	}

	get selectedFile() {
		return this.#selectedFile;
	}

	get selectedRepository() {
		return this.#selectedRepository;
	}

	get selectedCommit() {
		return this.#selectedCommit;
	}

	get selectedCommitFiles() {
		return this.#selectedCommitFiles;
	}

	get selectedCommitFile() {
		return this.#selectedCommitFile;
	}

	get historyOpen() {
		return this.#historyOpen;
	}

	get isRefetchingSelectedRepository() {
		return this.#isRefetchingSelectedRepository;
	}

	get dragState() {
		return this.#dragState;
	}

	get showingPalette() {
		return this.#showingPalette;
	}

	get imageDisplayMode() {
		return this.#imageDisplayMode ?? 'sidebyside';
	}

	setShowingPalette(showing: boolean | ((s: boolean) => boolean)) {
		this.#showingPalette =
			typeof showing === 'function' ? showing(this.#showingPalette) : showing;
		this.emit();
	}

	setSelectedFile(file: GitFile | undefined) {
		if (file?.id === this.#selectedFile?.id) return;

		this.#selectedFile = file;
		this.emit();

		window._triggerWorkflow('navigate', this.selectedRepository, file);
	}

	setHistoryOpen(open: boolean) {
		this.#historyOpen = open;
		this.emit();
	}

	setSelectedCommit(commit: LogCommit | undefined) {
		this.#selectedCommit = commit;
		this.emit();
	}

	setSelectedCommitFiles(commit: PastCommit | undefined) {
		this.#selectedCommitFiles = commit;
		this.emit();
	}

	setSelectedCommitFile(file: PastCommit['files'][number] | undefined) {
		if (file === this.#selectedCommitFile) return;

		this.#selectedCommitFile = file;
		this.emit();
	}

	setSelectedRepository(repository: Repository | undefined, set = true) {
		if (!repository) {
			return;
		}

		this.#selectedFile = undefined;
		this.#selectedCommit = undefined;
		this.#selectedCommitFiles = undefined;
		this.#selectedCommitFile = undefined;
		this.#selectedRepository = repository;
		this.emit();

		window._triggerWorkflow('navigate', repository, this.selectedFile);

		if (set) SettingsStore.setSetting('activeRepository', repository?.path);

		if (FileStore.getByRepositoryPath(repository?.path)?.length) {
			this.setSelectedFile(FileStore.getByRepositoryPath(repository?.path)?.[0]);
		}
	}

	clearSelectedRepository() {
		this.#selectedRepository = undefined;
		this.emit();

		window._triggerWorkflow('navigate', undefined, undefined);
	}

	setIsRefetchingSelectedRepository(value: boolean) {
		this.#isRefetchingSelectedRepository = value;
		this.emit();
	}

	setDragState(e: DragEvent | null) {
		this.#dragState = e;
		this.emit();
	}

	setImageDisplayMode(mode: 'sidebyside' | 'difference') {
		this.#imageDisplayMode = mode;
		this.emit();
	}
})();

export default LocationStore;
