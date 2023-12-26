import { Accessor, For, Setter, Show, createRoot } from 'solid-js';

import { openInEditor } from '@app/modules/code';
import { t } from '@app/modules/i18n';
import FileStore, { GitFile } from '@app/stores/files';
import SettingsStore from '@app/stores/settings';
import { removeRepository } from '@modules/actions';
import { debug } from '@modules/logger';
import { openExternal, showItemInFolder } from '@modules/shell';
import { renderDate } from '@modules/time';
import { createStoreListener } from '@stores/index';
import LayerStore from '@stores/layer';
import LocationStore from '@stores/location';
import ModalStore from '@stores/modal';
import RepositoryStore, { Repository } from '@stores/repository';

import Button from '@ui/Common/Button';
import Icon from '@ui/Common/Icon';
import Tooltip from '@ui/Common/Tooltip';
import Menu from '@ui/Menu';
import GithubModal from '@ui/Modal/GithubModal';
import RepositoryModal from '@ui/Modal/RepositoryModal';

import './index.scss';

const hasUncommittedChanges = (files: Map<string, GitFile[]>, repository: Repository) => {
	const changes = files.get(repository.path);

	if (!changes) return false;

	return changes.length > 0;
};

export interface HeaderDrawerProps {
	open: [Accessor<boolean>, (value: boolean) => void];
	ref: [Accessor<HTMLDivElement | undefined>, Setter<HTMLDivElement | undefined>];
}

export default (props: HeaderDrawerProps) => {
	const repositories = createStoreListener([RepositoryStore], () => RepositoryStore.repositories);
	const selected = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getById(LocationStore.selectedRepository?.id)
	);
	const files = createStoreListener([FileStore], () => FileStore.files);

	return (
		<div
			ref={props.ref[1]}
			aria-hidden={!props.open[0]()}
			classList={{
				sidebar__drawer: true,
				open: props.open[0]()
			}}
		>
			<div class="sidebar__drawer__body">
				<div class="sidebar__drawer__body__header" tabIndex={0}>
					{t('sidebar.drawer.title')}
					<Tooltip text={t('sidebar.drawer.contextMenu.addRepository')}>
						{(p) => (
							<Menu
								event="click"
								items={[
									{
										type: 'item',
										label: t('sidebar.drawer.contextMenu.addRepository'),
										onClick: () => {
											ModalStore.addModal({
												type: 'add-repository',
												element: createRoot(() => (
													<RepositoryModal tab="add" />
												))
											});
										}
									},
									{
										type: 'item',
										label: t('sidebar.drawer.contextMenu.createRepository'),
										onClick: () => {
											ModalStore.addModal({
												type: 'create-repository',
												element: createRoot(() => (
													<RepositoryModal tab="create" />
												))
											});
										}
									},
									{
										type: 'item',
										label: t('sidebar.drawer.contextMenu.cloneFromGitHub'),
										onClick: () => {
											ModalStore.addModal({
												type: 'github-repository',
												element: createRoot(GithubModal)
											});
										}
									}
								]}
							>
								<button
									{...p}
									aria-role="button"
									aria-label={t('sidebar.drawer.contextMenu.addRepository')}
									class="sidebar__drawer__body__header__button"
								>
									<Icon name="plus" />
								</button>
							</Menu>
						)}
					</Tooltip>
				</div>
				<div class="sidebar__drawer__body__content">
					<For
						each={Array.from(repositories() || []).sort((a, b) =>
							a[1].name.localeCompare(b[1].name)
						)}
					>
						{([, repository]) => (
							<>
								<Menu
									items={[
										{
											type: 'item',
											label: t('sidebar.drawer.contextMenu.viewIn', {
												name:
													window.Native.platform === 'darwin'
														? 'Finder'
														: 'Explorer'
											}),
											onClick: () => {
												showItemInFolder(repository.path);
											}
										},
										{
											type: 'item',
											label: t('sidebar.contextMenu.openRemote'),
											onClick: () => {
												openExternal(repository.remote);
											}
										},
										{
											type: 'item',
											label: t('sidebar.contextMenu.openIn', {
												name: t(
													`settings.general.editor.${
														SettingsStore.getSetting(
															'externalEditor'
														) || 'code'
													}`
												)
											}),
											onClick: () => {
												openInEditor(repository.path);
											}
										},
										{
											type: 'separator'
										},
										{
											type: 'item',
											label: t('sidebar.drawer.contextMenu.remove'),
											color: 'danger',
											onClick: () => {
												removeRepository(repository);
											}
										}
									]}
								>
									<button
										aria-role="button"
										aria-label={t('sidebar.drawer.switchTo', {
											name: repository.name
										})}
										aria-selected={selected()?.id === repository.id}
										classList={{
											sidebar__drawer__body__content__item: true,
											active: selected()?.id === repository.id
										}}
										onClick={() => {
											props.open[1](false);

											debug(
												'Transitioning to repository: ' + repository.name
											);

											LocationStore.setSelectedRepository(repository);
										}}
									>
										<div class="sidebar__drawer__body__content__item__text">
											{repository.name}
											<div class="sidebar__drawer__body__content__item__text__details">
												{repository.branch} -{' '}
												{renderDate(repository.lastFetched || 0)()}
											</div>
										</div>
										<Show when={hasUncommittedChanges(files()!, repository)}>
											<div class="sidebar__drawer__body__content__item__indicator" />
										</Show>
									</button>
								</Menu>
							</>
						)}
					</For>
				</div>
			</div>
			<div class="sidebar__drawer__footer">
				<Button
					label={t('sidebar.drawer.openSettings')}
					type="default"
					onClick={() => {
						props.open[1](false);
						LayerStore.setVisible('settings', true);
					}}
				>
					{t('sidebar.drawer.settings')}
				</Button>
			</div>
		</div>
	);
};
