import { For, Show, createSignal } from 'solid-js';

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

	const [footerShowing, setFooterShowing] = createSignal(false);

	let lastRepository: Repository | undefined;

	createStoreListener([RepositoryStore, LocationStore], async () => {
		if (!LocationStore.selectedRepository) return;

		setCommits(await Git.Log(LocationStore.selectedRepository));

		try {
			if (lastRepository === LocationStore.selectedRepository) return;

			lastRepository = LocationStore.selectedRepository;
		} catch (error) {
			showErrorModal(error, 'error.fetching');

			logger.error(error);
		}
	});

	return (
		<div
			classList={{ sidebar: true, 'sidebar-active': props.sidebar }}
			aria-role="sidebar"
			aria-hidden={props.sidebar}
		>
			<Header />
			<Show when={historyOpen()}>
				<div class="sidebar__commits">
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
						height: footerShowing() ? 'calc(100% - 336px)' : 'calc(100% - 92px)'
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
		</div>
	);
};
