import { For, Show, createSignal } from 'solid-js';
import { useInfiniteScroll } from 'solidjs-use';

import { LogCommit } from '@app/modules/git/log';
import { t } from '@app/modules/i18n';
import RepositoryStore, { Repository } from '@app/stores/repository';
import * as Git from '@modules/git';
import * as logger from '@modules/logger';
import FileStore from '@stores/files';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';

import EmptyState from '@ui/Common/EmptyState';
import Header from '@ui/Sidebar/Header';
import Item from '@ui/Sidebar/Item';

import { showErrorModal } from '../Modal';
import Commit from './Commit';
import Footer from './Footer';

import './index.scss';

export interface SidebarProps {
	sidebar: boolean;
}

export default (props: SidebarProps) => {
	const files = createStoreListener([FileStore, LocationStore], () =>
		FileStore.getByRepositoryPath(LocationStore.selectedRepository?.path)
	);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const [commits, setCommits] = createSignal<LogCommit[]>([]);
	const [commitsRef, setCommitsRef] = createSignal<HTMLDivElement | null>(null);

	const [footerShowing, setFooterShowing] = createSignal(false);

	let lastRepository: Repository | undefined;

	createStoreListener([RepositoryStore, LocationStore], async () => {
		if (!LocationStore.selectedRepository) return;

		setCommits(await Git.Log(LocationStore.selectedRepository, 50));

		try {
			if (lastRepository === LocationStore.selectedRepository) return;

			lastRepository = LocationStore.selectedRepository;
		} catch (error) {
			showErrorModal(error, 'error.fetching');

			logger.error(error);
		}
	});

	useInfiniteScroll(
		commitsRef,
		async () => {
			if (!LocationStore.selectedRepository) return;

			const newItems = await Git.Log(
				LocationStore.selectedRepository,
				50,
				commits()[commits().length - 1]
			);

			if (newItems.some((item) => commits().some((c) => c.hash === item.hash))) {
				return; // we already have this item
			}

			setCommits((commits) => commits.concat(newItems));
		},
		{
			distance: 100
		}
	);

	return (
		<aside
			classList={{ sidebar: true, 'sidebar-active': props.sidebar }}
			aria-hidden={!props.sidebar}
		>
			<Header />
			<Show when={historyOpen()}>
				<div class="sidebar__commits" ref={setCommitsRef}>
					<Show
						when={commits()?.length}
						fallback={<EmptyState hint={t('sidebar.noCommits')} />}
					>
						<For each={commits()}>
							{(commit) => {
								return <Commit {...commit} />;
							}}
						</For>
					</Show>
				</div>
			</Show>
			<Show when={!historyOpen()}>
				<div
					class="sidebar__items"
					style={{
						height: footerShowing() ? 'calc(100% - 336px)' : 'calc(100% - 112px)'
					}}
				>
					<Show
						when={files()?.length}
						fallback={<EmptyState hint={t('sidebar.upToDate')} />}
					>
						<For each={files()}>
							{(file) => {
								if (file.status === 'untracked') return null;

								return <Item {...file} />;
							}}
						</For>
					</Show>
				</div>
			</Show>
			<Show when={!historyOpen()}>
				<Footer showingSignal={[footerShowing, setFooterShowing]} />
			</Show>
		</aside>
	);
};
