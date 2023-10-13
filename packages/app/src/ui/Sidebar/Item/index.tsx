const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import { addToGitignore } from '@app/modules/git/gitignore';
import RepositoryStore from '@app/stores/repository';
import { createStoreListener } from '@stores/index';
import { showItemInFolder } from '@modules/shell';
import { openInEditor } from '@app/modules/code';
import SettingsStore from '@app/stores/settings';
import { debug, error } from '@modules/logger';
import LocationStore from '@stores/location';
import * as Git from '@app/modules/git';
import FileStore from '@stores/files';
import { t } from '@app/modules/i18n';

import type { IFile } from '@stores/files';

import { showErrorModal } from '@app/ui/Modal';
import Menu from '@ui/Menu';

import './index.scss';

export default (props: IFile) => {
	const selected = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getById(LocationStore.selectedRepository?.id)
	);
	const selectedFile = createStoreListener([LocationStore], () => LocationStore.selectedFile);

	const extension = (name: string) => {
		const parts = name.split('.');
		return parts.length > 1 ? parts[parts.length - 1] : '';
	};

	return (
		<Menu
			items={[
				{
					label: props.staged
						? t('sidebar.contextMenu.unstage')
						: t('sidebar.contextMenu.stage'),
					type: 'item',
					onClick: () => {
						FileStore.toggleStaged(selected().path, props);
					}
				},
				{
					label: t('sidebar.contextMenu.stash'),
					type: 'item',
					onClick: async () => {
						try {
							await Git.Stash(selected());
						} catch (e) {
							showErrorModal(e, 'error.git');

							error(e);
						}
					}
				},
				{
					label: t('sidebar.contextMenu.discard'),
					type: 'item',
					color: 'danger',
					onClick: async () => {
						await Git.Discard(selected(), props);
					}
				},
				{
					type: 'separator'
				},
				{
					label: t('sidebar.contextMenu.ignore'),
					type: 'item',
					disabled: extension(props.name) === 'gitignore',
					onClick: () => {
						addToGitignore(selected(), path.join(props.path, props.name));
					}
				},
				{
					label: t('sidebar.contextMenu.ignoreExt', { ext: extension(props.name) }),
					type: 'item',
					disabled: extension(props.name) === 'gitignore',
					onClick: () => {
						addToGitignore(selected(), '.' + extension(props.name));
					}
				},
				{
					type: 'separator'
				},
				{
					label: t('sidebar.contextMenu.viewIn', {
						name: window.Native.platform === 'darwin' ? 'Finder' : 'Explorer'
					}),
					type: 'item',
					onClick: () => {
						showItemInFolder(path.join(selected().path, props.path, props.name));
					},
					disabled: props.status === 'deleted'
				},
				{
					label: t('sidebar.contextMenu.openIn', {
						name: t(
							`settings.general.editor.${
								SettingsStore.getSetting('externalEditor') || 'code'
							}`
						)
					}),
					type: 'item',
					disabled: props.status === 'deleted',
					onClick: () => {
						openInEditor(path.join(selected().path, props.path, props.name));
					}
				}
			]}
		>
			<div
				aria-role="button"
				aria-label={t('sidebar.open', {
					name: props.name
				})}
				aria-selected={selectedFile() === props}
				class={`sidebar__item ${selectedFile() === props ? 'active' : ''}`}
				data-id={props.id}
				data-active={selectedFile() === props}
				data-status={props.status}
				onClick={() => {
					debug('Transitioning to file', props.name, 'in', props.path);
					LocationStore.setSelectedFile(props);
				}}
			>
				<div class="sidebar__item__filename">
					<span class="sidebar__item__filename__path" title={props.path}>
						{props.path}
					</span>
					<span class="sidebar__item__filename__name">
						<span class="sidebar__item__filename__name__separator">
							{props.path.length ? '/' : ''}
						</span>
						{props.name}
					</span>
				</div>
				<button
					aria-role="button"
					aria-label={
						props.staged
							? t('sidebar.contextMenu.unstage')
							: t('sidebar.contextMenu.stage')
					}
					onClick={() => {
						FileStore.toggleStaged(selected().path, props);
					}}
					class={`sidebar__item__status ${props.status} ${props.staged ? 'staged' : ''}`}
				>
					{props.status === 'modified'
						? 'M'
						: props.status === 'added'
						? 'A'
						: props.status === 'deleted'
						? 'D'
						: props.status === 'renamed'
						? 'R'
						: props.status === 'copied'
						? 'C'
						: props.status === 'unmerged'
						? 'U'
						: props.status === 'untracked'
						? '?'
						: ''}
				</button>
			</div>
		</Menu>
	);
};
