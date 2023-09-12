import { createSignal } from 'solid-js';

import { CommitStyle, getCommitStyledMessage, validateCommitMessage } from '@modules/commits';
import { refetchRepository } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import SettingsStore from '@stores/settings';
import LocationStore from '@stores/location';
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
		const files = FilesStore.getFilesByRepositoryPath(LocationStore.selectedRepository?.path);

		const style = settings()?.get('commitStyles')[selected()?.path];

		if (!style) return { message: '', style: 'none' };

		const message = getCommitStyledMessage(
			{ files: files?.map((f) => f?.path) },
			style as CommitStyle
		)?.message;

		return { message, style };
	});

	return (
		<div class={`sidebar__footer ${selected() && changes() && staged() ? '' : 'hidden'}`}>
			<TextArea
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
				value={description()}
				placeholder="Description"
				onChange={setDescription}
				expanded={true}
			/>
			<Button
				type={error() ? 'danger' : 'brand'}
				onClick={async () => {
					await Git.Commit(selected(), summary(), description());

					await refetchRepository(selected());

					setSummary('');
				}}
				disabled={!Boolean(summary().length)}
			>
				Commit to {selected()?.branch || 'Remote'}
			</Button>
		</div>
	);
};
