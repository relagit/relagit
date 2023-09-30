const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import { createStoreListener } from '@stores/index';
import { showItemInFolder } from '@modules/shell';
import { debug, error } from '@modules/logger';
import LocationStore from '@stores/location';
import { useI18n } from '@app/modules/i18n';
import * as Git from '@app/modules/git';
import FileStore from '@stores/files';

import type { IFile } from '@stores/files';

import { showErrorModal } from '@app/ui/Modal';
import Menu from '@ui/Menu';

import './index.scss';

export default (props: IFile) => {
	const selected = createStoreListener([LocationStore], () => LocationStore.selectedRepository);
	const selectedFile = createStoreListener([LocationStore], () => LocationStore.selectedFile);

	const t = useI18n();

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
							showErrorModal(e, 'Unknown error while stashing changes');

							error(e);
						}
					}
				},
				{
					label: t('sidebar.contextMenu.discard'),
					type: 'item',
					color: 'danger'
				},
				{
					type: 'separator'
				},
				{
					label: t('sidebar.contextMenu.ignore'),
					type: 'item'
				},
				{
					label: t('sidebar.contextMenu.ignoreExt', { ext: extension(props.name) }),
					type: 'item',
					disabled: extension(props.name) === '.gitingore'
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
					label: t('sidebar.contextMenu.openIn', { name: 'Code' }),
					type: 'item',
					disabled: props.status === 'deleted'
				}
			]}
		>
			<div
				aria-role="button"
				aria-label={`Open ${props.name}`}
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
					aria-label={`${props.staged ? 'Unstage' : 'Stage'} Changes`}
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
