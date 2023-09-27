import { createSignal } from 'solid-js';

import { CommitStyle, getCommitStyledMessage, validateCommitMessage } from '@modules/commits';
import { refetchRepository } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import { showErrorModal } from '@ui/Modal';
import SettingsStore from '@stores/settings';
import LocationStore from '@stores/location';
import * as logger from '@modules/logger';
import FilesStore from '@stores/files';
import * as Git from '@modules/git';

import TextArea from '@ui/Common/TextArea';
import Button from '@ui/Common/Button';

import './index.scss';

export default () => {
	const [description, setDescription] = createSignal('');
	const [summary, setSummary] = createSignal('');
	const [error, setError] = createSignal(false);

	const changes = createStoreListener([FilesStore, LocationStore], () =>
		FilesStore.getFilesByRepositoryPath(LocationStore.selectedRepository?.path)
	);
	const staged = createStoreListener([FilesStore, LocationStore], () =>
		FilesStore.hasStagedFiles(LocationStore.selectedRepository?.path)
	);
	const selected = createStoreListener([LocationStore], () => LocationStore.selectedRepository);
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

	const commitMessage = createStoreListener([SettingsStore, LocationStore, FilesStore], () => {
		const files = FilesStore.getStagedFilePaths(LocationStore.selectedRepository?.path);

		const style = settings()?.get('commitStyles')?.[selected()?.path];

		if (!style) return { message: '', style: 'none' };

		const message = getCommitStyledMessage(
			{ files },
			style as CommitStyle,
			settings()?.get('preferParens') as boolean
		)?.message;

		return { message, style };
	});

	return (
		<div class={`sidebar__footer ${selected() && changes() && staged() ? '' : 'hidden'}`}>
			<TextArea
				disabled={!(selected() && changes() && staged())}
				value={summary()}
				placeholder={commitMessage()?.message || 'Summary'}
				onChange={(value) => {
					if (
						settings()?.get('enforceCommitMessageStyle') === true &&
						commitMessage()?.style !== 'none'
					) {
						const allowed = validateCommitMessage(
							value,
							commitMessage()?.style as CommitStyle
						);

						if (allowed) {
							setError(false);

							setSummary(value);
						} else {
							setError(true);

							setSummary(value);
						}
					} else {
						setError(false);

						setSummary(value);
					}
				}}
				onContextMenu={() => {
					if (summary().length) return;

					setSummary(commitMessage()?.message || '');
				}}
			/>
			<TextArea
				disabled={!(selected() && changes() && staged())}
				value={description()}
				placeholder="Description"
				onChange={setDescription}
				expanded={true}
			/>
			<Button
				label={`Commit to ${selected()?.branch || 'Remote'}`}
				type={error() ? 'danger' : 'brand'}
				onClick={async () => {
					LocationStore.setSelectedFile(null);

					try {
						await Git.Commit(selected(), summary(), description());
					} catch (e) {
						showErrorModal(e, 'Unknown error while committing changes');

						logger.error(e);

						return;
					}

					setSummary('');

					await refetchRepository(selected());
				}}
				disabled={!Boolean(summary().length)}
			>
				Commit to {selected()?.branch || 'Remote'}
			</Button>
		</div>
	);
};
