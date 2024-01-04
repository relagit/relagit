import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '..';
import { For, Show, createRoot, createSignal } from 'solid-js';

import * as Git from '@app/modules/git';
import { getMonthCounts } from '@app/modules/git/log';
import { t } from '@app/modules/i18n';
import { openExternal, showItemInFolder } from '@app/modules/shell';
import { renderDate } from '@app/modules/time';
import { createStoreListener } from '@app/stores';
import LocationStore from '@app/stores/location';
import ModalStore from '@app/stores/modal';
import RepositoryStore from '@app/stores/repository';
import EmptyState from '@app/ui/Common/EmptyState';
import Icon from '@app/ui/Common/Icon';
import TabView from '@app/ui/Common/TabView';
import Tooltip from '@app/ui/Common/Tooltip';
import * as ipc from '~/common/ipc';

import './index.scss';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;

const MetadataItem = (props: {
	label: string;
	value: string;
	openExternal?: (e: Event) => void;
}) => {
	return (
		<div class="information-modal__metadata__panel__item">
			<div class="information-modal__metadata__panel__item__label">
				{props.label}
				<Show when={props.openExternal}>
					<button
						class="information-modal__metadata__panel__item__label__button"
						onClick={props.openExternal}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								props.openExternal?.(e);
							}
						}}
					>
						<Icon name="link-external" />
					</button>
				</Show>
			</div>
			<div class="information-modal__metadata__panel__item__value">{props.value}</div>
		</div>
	);
};

export const InformationModal = () => {
	const repository = createStoreListener(
		[RepositoryStore, LocationStore],
		() => LocationStore.selectedRepository
	);

	const [size, setSize] = createSignal<string>();
	const [months, setMonths] = createSignal<number[]>();
	const [largestMonth, setLargestMonth] = createSignal<number>();

	createStoreListener([RepositoryStore, LocationStore], async () => {
		if (!repository()) return;

		const res = await ipcRenderer.invoke(ipc.DISK_SIZE, repository()?.path);

		const size = res.split('\t')[0] + 'B';

		setSize(size);

		const months = getMonthCounts(await Git.Log(repository()!));

		setMonths(months);

		const largestMonth = Math.max(...months);

		setLargestMonth(largestMonth);
	});

	const Metadata = (
		<>
			<div class="information-modal__metadata">
				<div class="information-modal__metadata__panel metadata">
					<MetadataItem
						label={t('modal.information.items.diskPath')}
						value={repository()?.path || t('modal.information.items.unknown')}
						openExternal={() => {
							showItemInFolder(repository()?.path || '');
						}}
					/>
					<MetadataItem
						label={t('modal.information.items.diskSize')}
						value={size() || t('modal.information.items.unknown')}
					/>
					<MetadataItem
						label={t('modal.information.items.updated')}
						value={renderDate(repository()?.lastFetched || 0)()!}
					/>
					<MetadataItem
						label={t('modal.information.items.remote')}
						value={repository()?.remote || t('modal.information.items.unknown')}
						openExternal={() => {
							openExternal(repository()?.remote || '');
						}}
					/>
				</div>
				<div class="information-modal__metadata__panel">
					<div class="information-modal__metadata__panel__label">
						{t('modal.information.commitsMonth')}
					</div>
					<Show
						when={largestMonth()}
						fallback={
							<EmptyState
								hint={t('modal.information.gatheringInformation')}
								spinner
							/>
						}
					>
						<div class="information-modal__metadata__panel__graph">
							<div class="information-modal__metadata__panel__graph__values">
								<For each={new Array(12)}>
									{(_, i) => (
										<Tooltip
											text={t('modal.information.commitsInMonth', {
												count: months()?.[i() as 0] || 0,
												month: t(`modal.information.month.${i() as 0}`)
											})}
										>
											{(p) => (
												<div
													{...p}
													tabIndex={months()![i() as 0] > 0 ? 0 : -1}
													class="information-modal__metadata__panel__graph__values__item"
													style={{
														'--alpha-factor': `${
															((months()?.[i() as 0] || 0) /
																largestMonth()!) *
																0.5 +
															0.3
														}`,
														height: `${
															((months()?.[i() as 0] || 0) /
																largestMonth()!) *
															100
														}%`
													}}
												/>
											)}
										</Tooltip>
									)}
								</For>
							</div>
							<div class="information-modal__metadata__panel__graph__labels">
								<For each={new Array(12)}>
									{(_, i) => (
										<div class="information-modal__metadata__panel__graph__labels__item">
											{t(`modal.information.month.${i() as 0}`)}
										</div>
									)}
								</For>
							</div>
						</div>
					</Show>
				</div>
			</div>
		</>
	);

	// TODO: do soemthing here
	const Graph = <>hi</>;

	return (
		<Modal size="x-large" dismissable id={'information'}>
			{(p) => {
				return (
					<>
						<ModalHeader title={repository()?.name}>
							<ModalCloseButton close={p.close} />
						</ModalHeader>
						<ModalBody>
							<TabView
								views={[
									{
										label: t('modal.information.metadata'),
										value: 'metadata',
										element: Metadata
									},
									{
										label: t('modal.information.graph'),
										value: 'graph',
										element: Graph
									}
								]}
							/>
						</ModalBody>
					</>
				);
			}}
		</Modal>
	);
};

export const showInformationModal = () => {
	ModalStore.pushState('information', createRoot(InformationModal));
};
