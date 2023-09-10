import { Accessor, Setter, For } from 'solid-js';

import { createStoreListener } from '@stores/index';
import { removeRepository } from '@modules/actions';
import { showItemInFolder } from '@modules/shell';
import RepositoryStore from '@stores/repository';
import LocationStore from '@stores/location';
import { renderDate } from '@modules/time';
import LayerStore from '@stores/layer';
import ModalStore from '@stores/modal';
import { log } from '@modules/logger';

import RepositoryModal from '@ui/Modal/RepositoryModal';
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

	return (
		<div
			classList={{
				sidebar__drawer: true,
				open: props.open[0]()
			}}
		>
			<div class="sidebar__drawer__body">
				<div class="sidebar__drawer__body__header">
					Repositories
					<Menu
						event="click"
						items={[
							{
								type: 'item',
								label: 'Create Repository Group'
							},
							{
								type: 'separator'
							},
							{
								type: 'item',
								label: 'Add Repository',
								onClick: () => {
									ModalStore.addModal({
										type: 'add-repository',
										element: <RepositoryModal tab="add" />
									});
								}
							},
							{
								type: 'item',
								label: 'Create Repository',
								onClick: () => {
									ModalStore.addModal({
										type: 'create-repository',
										element: <RepositoryModal tab="create" />
									});
								}
							}
						]}
					>
						<button class="sidebar__drawer__body__header__button">
							<Icon name="plus" />
						</button>
					</Menu>
				</div>
				<div class="sidebar__drawer__body__content">
					<For each={repositories()}>
						{(repository) => (
							<>
								<Menu
									items={[
										{
											type: 'item',
											label: `View in ${
												window.Native.platform === 'darwin'
													? 'Finder'
													: 'Explorer'
											}`,
											onClick: () => {
												showItemInFolder(repository.path);
											}
										},
										{
											type: 'item',
											label: 'Remove',
											color: 'danger',
											onClick: () => {
												removeRepository(repository);
											}
										}
									]}
								>
									<button
										classList={{
											sidebar__drawer__body__content__item: true,
											selected: selected()?.name === repository.name
										}}
										onClick={() => {
											props.open[1](false);
											log('Transitioning to repository: ' + repository.name);
											LocationStore.setSelectedRepository(repository);
										}}
									>
										{repository.name}
										<div class="sidebar__drawer__body__content__item__details">
											{repository.branch} -{' '}
											{renderDate(repository.lastFetched)}
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
					type="default"
					onClick={() => {
						props.open[1](false);
						LayerStore.setVisible('settings', true);
					}}
				>
					Settings
				</Button>
			</div>
		</div>
	);
};
