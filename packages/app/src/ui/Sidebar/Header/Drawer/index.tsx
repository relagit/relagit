import { Accessor, For, Setter, Show, createMemo, createRoot, createSignal } from 'solid-js';

import { openInEditor } from '@app/modules/editor';
import { t } from '@app/modules/i18n';
import FileStore, { GitFile } from '@app/stores/files';
import SettingsStore from '@app/stores/settings';
import { removeRepository } from '@modules/actions';
import { canUseRepositoryAsWorkflow, useRepositoryAsWorkflow } from '@modules/actions/external';
import { debug } from '@modules/logger';
import { openExternal, showItemInFolder } from '@modules/shell';
import { renderDate } from '@modules/time';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import ModalStore from '@stores/modal';
import RepositoryStore, { Repository } from '@stores/repository';
import AffinityStore from '~/app/src/stores/affinity';

import Icon from '@ui/Common/Icon';
import Tooltip from '@ui/Common/Tooltip';
import Menu from '@ui/Menu';
import CloneModal from '@ui/Modal/CloneModal';
import { showRepoModal } from '@ui/Modal/RepositoryModal';

import EmptyState from '../../../Common/EmptyState';
import TextArea from '../../../Common/TextArea';

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
	const [filter, setFilter] = createSignal('');
	const repositories = createStoreListener([RepositoryStore], () => RepositoryStore.repositories);
	const selected = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getById(LocationStore.selectedRepository?.id)
	);
	const files = createStoreListener([FileStore], () => FileStore.files);
	const affinities = createStoreListener([AffinityStore], () => AffinityStore);

	const filtered = createMemo((): Repository[] => {
		const filterValue = filter().toLowerCase();

		const searchable = Array.from(repositories()?.values() || []).sort((a, b) =>
			a.name.localeCompare(b.name)
		);

		return searchable
			.filter((repository) => {
				if (!filterValue) return true;

				const name = repository.name.toLowerCase().includes(filterValue);
				const path = repository.path.toLowerCase().includes(filterValue);
				const remote = repository.remote.toLowerCase().includes(filterValue);

				return name || path || remote;
			})
			.sort((a, b) => {
				return affinities()?.sort(a, b) || 0;
			});
	});

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
					<TextArea
						placeholder={t('sidebar.drawer.title')}
						label={t('sidebar.drawer.title')}
						value={filter()}
						icon="search"
						onChange={setFilter}
						className="sidebar__drawer__body__header__search"
					/>
					<Tooltip text={t('sidebar.drawer.contextMenu.addRepository')}>
						{(p) => (
							<Menu
								interfaceId="sidebar-drawer"
								event="mousedown"
								items={[
									{
										type: 'item',
										accelerator: {
											key: 'o',
											meta: true
										},
										label: t('sidebar.drawer.contextMenu.addRepository'),
										onClick: () => {
											showRepoModal('add');
										}
									},
									{
										type: 'item',
										accelerator: {
											key: 'n',
											meta: true
										},
										label: t('sidebar.drawer.contextMenu.createRepository'),
										onClick: () => {
											showRepoModal('create');
										}
									},
									{
										type: 'item',
										accelerator: {
											key: 'o',
											shift: true,
											meta: true
										},
										label: t('sidebar.drawer.contextMenu.cloneRepository'),
										onClick: () => {
											ModalStore.pushState(
												'clone',
												createRoot(() => <CloneModal />)
											);
										}
									}
								]}
							>
								<button
									{...p}
									role="button"
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
					<Show
						when={filtered().length}
						fallback={<EmptyState hint={t('sidebar.drawer.empty')} />}
					>
						<For each={filtered()}>
							{(repository) => (
								<>
									<Menu
										interfaceId="sidebar-drawer-repository"
										items={[
											{
												type: 'item',
												label: t('sidebar.drawer.contextMenu.viewIn', {
													name:
														window.Native.platform === 'darwin' ?
															'Finder'
														:	'Explorer'
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
												label: t('sidebar.drawer.contextMenu.useWorkflow'),
												disabled: !canUseRepositoryAsWorkflow(repository),
												onClick: () => {
													useRepositoryAsWorkflow(repository);
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
											role="button"
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

												RepositoryStore.makePermanent(repository);

												debug(
													'Transitioning to repository: ' +
														repository.name
												);

												LocationStore.setSelectedRepository(repository);
											}}
										>
											<div class="sidebar__drawer__body__content__item__text">
												{repository.name}
												<div class="sidebar__drawer__body__content__item__text__details">
													<Show when={repository.branch}>
														{repository.branch}
														{' • '}
													</Show>
													{renderDate(
														repository.lastFetched ||
															new Date().getTime()
													)()}
												</div>
											</div>
											<Show
												when={
													hasUncommittedChanges(files()!, repository) ||
													repository.ahead ||
													repository.behind
												}
											>
												<div class="sidebar__drawer__body__content__item__indicator" />
											</Show>
										</button>
									</Menu>
								</>
							)}
						</For>
					</Show>
				</div>
			</div>
		</div>
	);
};
