import { Accessor, Setter, For } from 'solid-js';

import { createStoreListener } from '@stores/index';
import { removeRepository } from '@modules/actions';
import { showItemInFolder } from '@modules/shell';
import RepositoryStore from '@stores/repository';
import LocationStore from '@stores/location';
import { useI18n } from '@app/modules/i18n';
import { renderDate } from '@modules/time';
import { debug } from '@modules/logger';
import LayerStore from '@stores/layer';
import ModalStore from '@stores/modal';

import RepositoryModal from '@ui/Modal/RepositoryModal';
import GithubModal from '@ui/Modal/GithubModal';
import Button from '@ui/Common/Button';
import Icon from '@ui/Common/Icon';
import Menu from '@ui/Menu';

import './index.scss';

export interface IHeaderDrawerProps {
	open: [Accessor<boolean>, Setter<boolean>];
}

export default (props: IHeaderDrawerProps) => {
	const repositories = createStoreListener([RepositoryStore], () => RepositoryStore.repositories);
	const selected = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getByName(LocationStore.selectedRepository?.name)
	);

	const t = useI18n();

	return (
		<div
			aria-hidden={!props.open[0]()}
			classList={{
				sidebar__drawer: true,
				open: props.open[0]()
			}}
		>
			<div class="sidebar__drawer__body">
				<div class="sidebar__drawer__body__header">
					{t('sidebar.drawer.title')}
					<Menu
						event="click"
						items={[
							{
								type: 'item',
								label: t('sidebar.drawer.contextMenu.createGroup')
							},
							{
								type: 'separator'
							},
							{
								type: 'item',
								label: t('sidebar.drawer.contextMenu.addRepository'),
								onClick: () => {
									ModalStore.addModal({
										type: 'add-repository',
										element: <RepositoryModal tab="add" />
									});
								}
							},
							{
								type: 'item',
								label: t('sidebar.drawer.contextMenu.createRepository'),
								onClick: () => {
									ModalStore.addModal({
										type: 'create-repository',
										element: <RepositoryModal tab="create" />
									});
								}
							},
							{
								type: 'item',
								label: t('sidebar.drawer.contextMenu.cloneFromGitHub'),
								onClick: () => {
									ModalStore.addModal({
										type: 'github-repository',
										element: <GithubModal />
									});
								}
							}
						]}
					>
						<button
							aria-role="button"
							aria-label={t('sidebar.drawer.contextMenu.addRepository')}
							class="sidebar__drawer__body__header__button"
						>
							<Icon name="plus" />
						</button>
					</Menu>
				</div>
				<div class="sidebar__drawer__body__content">
					<For each={repositories().sort((a, b) => a.name.localeCompare(b.name))}>
						{(repository) => (
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
										{repository.name}
										<div class="sidebar__drawer__body__content__item__details">
											{repository.branch} -{' '}
											{renderDate(repository.lastFetched)()}
										</div>
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
