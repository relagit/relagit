import { Show } from 'solid-js';
import { getIconForFilePath, getIconUrlForFilePath } from 'vscode-material-icons';

import { triggerWorkflow } from '@app/modules/actions';
import { openInEditor } from '@app/modules/editor';
import * as Git from '@app/modules/git';
import { statusToAlpha } from '@app/modules/git/diff';
import { addToGitignore } from '@app/modules/git/gitignore';
import { t } from '@app/modules/i18n';
import RepositoryStore from '@app/stores/repository';
import SettingsStore from '@app/stores/settings';
import StageStore from '@app/stores/stage';
import Icon from '@app/ui/Common/Icon';
import { showErrorModal } from '@app/ui/Modal';
import { debug, error } from '@modules/logger';
import { showItemInFolder } from '@modules/shell';
import type { GitFile } from '@stores/files';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';

import Menu from '@ui/Menu';

import './index.scss';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');

export default (props: GitFile) => {
	const selected = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getById(LocationStore.selectedRepository?.id)
	);
	const selectedFile = createStoreListener([LocationStore], () => LocationStore.selectedFile);
	const staged = createStoreListener([StageStore], () =>
		StageStore.isStaged(path.join(props.path, props.name))
	);

	const extension = (name: string) => {
		const parts = name.split('.');
		return parts.length > 1 ? parts[parts.length - 1] : '';
	};

	return (
		<Menu
			interfaceId="sidebar-item"
			items={[
				{
					label:
						staged() ?
							t('sidebar.contextMenu.unstage')
						:	t('sidebar.contextMenu.stage'),
					type: 'item',
					onClick: () => {
						StageStore.toggleStaged(path.join(props.path, props.name));
					}
				},
				{
					label: t('sidebar.contextMenu.stash'),
					type: 'item',
					onClick: async () => {
						try {
							await Git.Stash(selected());

							triggerWorkflow('stash', selected()!);
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
						showItemInFolder(path.join(selected()!.path, props.path, props.name));
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
						openInEditor(path.join(selected()!.path, props.path, props.name));
					}
				}
			]}
		>
			<div
				aria-role="button"
				aria-label={t('sidebar.open', {
					name: path.join(props.path, props.name)
				})}
				aria-selected={selectedFile() === props}
				classList={{
					sidebar__item: true,
					active: selectedFile() === props
				}}
				data-id={props.id}
				data-active={selectedFile() === props}
				data-status={props.status}
				onClick={() => {
					debug('Transitioning to file', props.name, 'in', props.path);
					LocationStore.setSelectedFile(props);
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						debug('Transitioning to file', props.name, 'in', props.path);
						LocationStore.setSelectedFile(props);
					}
				}}
				tabIndex={0}
			>
				<Show when={getIconForFilePath(props.name)}>
					<div class="sidebar__item__fileicon">
						<img
							src={getIconUrlForFilePath(
								props.name,
								'../node_modules/vscode-material-icons/generated/icons'
							)}
							alt={getIconForFilePath(props.name)}
						/>
					</div>
				</Show>
				<div class="sidebar__item__filename">
					<Show when={props.from}>
						<span class="sidebar__item__filename__path" title={props.fromPath}>
							{props.fromPath}
						</span>
						<span class="sidebar__item__filename__name">
							<span class="sidebar__item__filename__name__separator">
								{props.fromPath?.length ? '/' : ''}
							</span>
							{props.from}
						</span>
						<span class="sidebar__item__filename__arrow">
							<Icon name="arrow-right" />
						</span>
					</Show>
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
						staged() ? t('sidebar.contextMenu.unstage') : t('sidebar.contextMenu.stage')
					}
					onClick={() => {
						StageStore.toggleStaged(path.join(props.path, props.name));
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();

							if (e.shiftKey) {
								StageStore.invert(selected());
								return;
							}

							StageStore.toggleStaged(path.join(props.path, props.name));
						}
					}}
					onDblClick={() => {
						StageStore.invert(selected());
					}}
					classList={{
						sidebar__item__status: true,
						[props.status]: true,
						staged: staged()
					}}
				>
					{statusToAlpha(props.status)}
				</button>
			</div>
		</Menu>
	);
};
