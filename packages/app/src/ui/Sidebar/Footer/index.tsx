import { createSignal } from 'solid-js';

import { CommitStyle, getCommitStyledMessage, validateCommitMessage } from '@modules/commits';
import RepositoryStore from '@app/stores/repository';
import { refetchRepository, triggerWorkflow } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import SettingsStore from '@stores/settings';
import LocationStore from '@stores/location';
import * as logger from '@modules/logger';
import FilesStore from '@stores/files';
import { t } from '@app/modules/i18n';
import * as Git from '@modules/git';

import { showErrorModal } from '@ui/Modal';
import TextArea from '@ui/Common/TextArea';
import Button from '@ui/Common/Button';

import './index.scss';
import DraftStore from '@app/stores/draft';

export default () => {
	const [error, setError] = createSignal(false);

	const draft = createStoreListener([DraftStore, LocationStore], () =>
		DraftStore.getDraft(LocationStore.selectedRepository?.path)
	);

	const changes = createStoreListener([FilesStore, LocationStore], () =>
		FilesStore.getByRepositoryPath(LocationStore.selectedRepository?.path)
	);
	const staged = createStoreListener([FilesStore, LocationStore], () =>
		FilesStore.hasStagedFiles(LocationStore.selectedRepository?.path)
	);
	const selected = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getById(LocationStore.selectedRepository?.id)
	);
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
				label={t('sidebar.footer.summary')}
				disabled={!(selected() && changes() && staged())}
				value={draft()?.message}
				placeholder={commitMessage()?.message || t('sidebar.footer.summary')}
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

							DraftStore.setDraft(LocationStore.selectedRepository?.path, {
								message: value,
								description: draft()?.description || ''
							});
						} else {
							setError(true);

							DraftStore.setDraft(LocationStore.selectedRepository?.path, {
								message: value,
								description: draft()?.description || ''
							});
						}
					} else {
						setError(false);

						DraftStore.setDraft(LocationStore.selectedRepository?.path, {
							message: value,
							description: draft()?.description || ''
						});
					}
				}}
				onContextMenu={() => {
					if (draft()?.message.length) return;

					DraftStore.setDraft(LocationStore.selectedRepository?.path, {
						message: commitMessage()?.message || '',
						description: draft()?.description || ''
					});
				}}
			/>
			<TextArea
				label={t('sidebar.footer.description')}
				disabled={!(selected() && changes() && staged())}
				value={draft()?.description}
				placeholder={t('sidebar.footer.description')}
				onChange={(value) => {
					DraftStore.setDraft(LocationStore.selectedRepository?.path, {
						message: draft()?.message || '',
						description: value
					});
				}}
				expanded={true}
			/>
			<Button
				label={t('sidebar.footer.commit', {
					branch: selected()?.branch || 'Remote'
				})}
				type={error() ? 'danger' : 'brand'}
				onClick={async () => {
					LocationStore.setSelectedFile(null);

					try {
						triggerWorkflow('commit', selected(), {
							summary: draft()?.message,
							description: draft()?.description
						});

						await Git.Commit(selected(), draft()?.message, draft()?.description);
					} catch (e) {
						showErrorModal(e, 'error.git');

						logger.error(e);

						return;
					}

					DraftStore.setDraft(LocationStore.selectedRepository?.path, {
						message: '',
						description: ''
					});

					await refetchRepository(selected());
				}}
				disabled={!draft()?.message.length}
			>
				{t('sidebar.footer.commit', {
					branch: selected()?.branch || 'Remote'
				})}
			</Button>
		</div>
	);
};
