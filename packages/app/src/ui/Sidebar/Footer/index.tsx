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

export default () => {
	const [description, setDescription] = createSignal('');
	const [summary, setSummary] = createSignal('');
	const [error, setError] = createSignal(false);

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
				disabled={!(selected() && changes() && staged())}
				value={summary()}
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
				placeholder={t('sidebar.footer.description')}
				onChange={setDescription}
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
							summary: summary(),
							description: description()
						});

						await Git.Commit(selected(), summary(), description());
					} catch (e) {
						showErrorModal(e, 'error.git');

						logger.error(e);

						return;
					}

					setSummary('');

					await refetchRepository(selected());
				}}
				disabled={!Boolean(summary().length)}
			>
				{t('sidebar.footer.commit', {
					branch: selected()?.branch || 'Remote'
				})}
			</Button>
		</div>
	);
};
