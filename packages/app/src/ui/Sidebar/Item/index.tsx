const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import { createStoreListener } from '@stores/index';
import { showItemInFolder } from '@modules/shell';
import LocationStore from '@stores/location';
import { debug } from '@modules/logger';
import FileStore from '@stores/files';

import type { IFile } from '@stores/files';

import Menu from '@ui/Menu';

import './index.scss';

export default (props: IFile) => {
	const selected = createStoreListener([LocationStore], () => LocationStore.selectedRepository);
	const selectedFile = createStoreListener([LocationStore], () => LocationStore.selectedFile);

	const extension = (name: string) => {
		const parts = name.split('.');
		return parts.length > 1 ? parts[parts.length - 1] : '';
	};

	return (
		<Menu
			items={[
				{
					label: `${props.staged ? 'Unstage' : 'Stage'} Changes`,
					type: 'item',
					onClick: () => {
						FileStore.toggleStaged(selected().path, props);
					}
				},
				{
					label: 'Stash Changes',
					type: 'item'
				},
				{
					label: 'Discard Changes',
					type: 'item',
					color: 'danger'
				},
				{
					type: 'separator'
				},
				{
					label: 'Add to gitignore',
					type: 'item'
				},
				{
					label: `Add all .${extension(props.name)} Files to gitignore`,
					type: 'item',
					disabled: extension(props.name) === '.gitingore'
				},
				{
					type: 'separator'
				},
				{
					label: `View in ${window.Native.platform === 'darwin' ? 'Finder' : 'Explorer'}`,
					type: 'item',
					onClick: () => {
						showItemInFolder(path.join(selected().path, props.path, props.name));
					},
					disabled: props.status === 'deleted'
				},
				{
					label: 'Open in Code',
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
