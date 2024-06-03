import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '..';
import { For, Show, createRoot, createSignal } from 'solid-js';
import * as ipc from '~/shared/ipc';

import * as Git from '@app/modules/git';
import { commitFormatsForProvider } from '@app/modules/github';
import { t } from '@app/modules/i18n';
import { warn } from '@app/modules/logger';
import { openExternal, showItemInFolder } from '@app/modules/shell';
import { relative, renderDate } from '@app/modules/time';
import { createStoreListener } from '@app/stores';
import LocationStore from '@app/stores/location';
import ModalStore from '@app/stores/modal';
import RepositoryStore from '@app/stores/repository';
import Anchor from '@app/ui/Common/Anchor';
import EmptyState from '@app/ui/Common/EmptyState';
import Icon from '@app/ui/Common/Icon';
import TabView from '@app/ui/Common/TabView';
import Tooltip from '@app/ui/Common/Tooltip';
import { GraphPoint } from '@modules/git/graph';
import { LogCommit, getMonthCounts } from '@modules/git/log';

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

	const [history, setHistory] = createSignal<LogCommit[]>([]);
	const [graph, setGraph] = createSignal<GraphPoint[]>([]);
	const [maxIndent, setMaxIndent] = createSignal<number>();
	const [size, setSize] = createSignal<string>();
	const [months, setMonths] = createSignal<
		{
			index: number;
			value: number;
		}[]
	>();
	const [largestMonth, setLargestMonth] = createSignal<number>();

	let last = '';

	createStoreListener([RepositoryStore, LocationStore], () => {
		if (!repository() || repository()?.id === last) return;

		last = repository()?.id || '';

		Git.Log(
			repository()!,
			Infinity,
			new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365)
		).then((history) => {
			setHistory(history);

			const months = getMonthCounts(history);

			setMonths(months);

			const largestMonth = Math.max(...months.map((m) => m.value));

			setLargestMonth(largestMonth);
		});

		Git.Graph(repository()!).then((graph) => {
			setGraph(graph);

			try {
				const maxIndent = Math.max(...graph.map((p) => p.indent));

				setMaxIndent(maxIndent || 0);
			} catch (e) {
				warn('Failed to calculate maximum commit graph indent', e);

				setMaxIndent(0);
			}
		});

		ipcRenderer.invoke(ipc.DISK_SIZE, repository()?.path).then((res) => {
			setSize(res.split('\t')[0] + 'B');
		});
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
						value={renderDate(repository()?.lastFetched || new Date().getTime())()!}
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
						{t('modal.information.commitsMonth', {
							month: t(
								`modal.information.month.${(new Date().getMonth() + (1 % 12)) as 0}`
							),
							year: new Date().getFullYear() - 1
						})}
					</div>
					<Show
						when={largestMonth() !== undefined && months() !== undefined}
						fallback={
							<EmptyState
								hint={t('modal.information.gatheringInformation')}
								spinner
							/>
						}
					>
						<div class="information-modal__metadata__panel__graph">
							<div class="information-modal__metadata__panel__graph__values">
								<For each={months() || []}>
									{({ index, value }) => {
										return (
											<Tooltip
												text={t('modal.information.commitsInMonth', {
													count: value || 0,
													month: t(
														`modal.information.month.${index as 0}`
													)
												})}
											>
												{(p) => (
													<div
														{...p}
														tabIndex={value > 0 ? 0 : -1}
														class="information-modal__metadata__panel__graph__values__item"
														style={{
															'--alpha-factor': `${
																((value || 0) / largestMonth()!) *
																	0.5 +
																0.3
															}`,
															height: `${
																((value || 0) / largestMonth()!) *
																100
															}%`
														}}
													/>
												)}
											</Tooltip>
										);
									}}
								</For>
							</div>
							<div class="information-modal__metadata__panel__graph__labels">
								<For each={months() || []}>
									{({ index }) => {
										return (
											<div class="information-modal__metadata__panel__graph__labels__item">
												{t(`modal.information.month.${index as 0}`)}
											</div>
										);
									}}
								</For>
							</div>
						</div>
					</Show>
				</div>
			</div>
		</>
	);

	const colors = ['blue', 'green', 'yellow', 'orange', 'red', 'indigo', 'violet'];

	const Graph = (
		<Show
			when={history().length}
			fallback={<EmptyState hint={t('modal.information.gatheringInformation')} spinner />}
		>
			<For each={history()}>
				{(commit) => {
					const point = graph().find((p) => p?.hash === commit.hash);

					return (
						<div class="information-modal__graph__item">
							<div class="information-modal__graph__item__indicator">
								<div
									class="information-modal__graph__item__indicator__line"
									style={{
										'--max-indent': maxIndent(),
										'--indent': point?.indent || 0,
										'--color': `var(--color-${colors[point?.indent || 0 % colors.length]}-500)`
									}}
								></div>
							</div>
							<div class="information-modal__graph__item__message">
								{commit.message.split('\n')[0]}
							</div>
							<Show when={point?.refs}>
								<div
									style={{
										'--color': `var(--color-${colors[point?.indent || 0 % colors.length]}-500)`,
										'--bg': `color-mix(in srgb, var(--color-${colors[point?.indent || 0 % colors.length]}-500) 10%, transparent 90%)`
									}}
									class="information-modal__graph__item__badge"
								>
									{point?.refs}
								</div>
							</Show>
							<div class="information-modal__graph__item__right">
								<Anchor
									href={`${repository()?.remote.replace(/\.git$/, '')}${commitFormatsForProvider(repository()?.remote || '', commit.hash)}`}
								>
									{commit.hash.substring(0, 7)}
								</Anchor>
								<div class="information-modal__graph__item__right__date">
									{relative(new Date(commit.date).getTime())}
								</div>
							</div>
						</div>
					);
				}}
			</For>
		</Show>
	);

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
