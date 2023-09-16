import { For, Show } from 'solid-js';

import Header from '@ui/Sidebar/Header';
import Item from '@ui/Sidebar/Item';

import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import FileStore from '@stores/files';

import EmptyState from '@ui/Common/EmptyState';
import Footer from './Footer';

import './index.scss';

export interface ISidebarProps {
	sidebar: boolean;
}

export default (props: ISidebarProps) => {
	const files = createStoreListener([FileStore, LocationStore], () =>
		FileStore.getFilesByRepositoryPath(LocationStore.selectedRepository?.path)
	);

	return (
		<div classList={{ sidebar: true, 'sidebar-active': props.sidebar }}>
			<Header />
			<div class="sidebar__items">
				<Show
					when={files()?.length}
					fallback={<EmptyState hint="You're all up to date." />}
				>
					<For each={files()}>
						{(file) => {
							if (file.status === 'untracked') return null;

							return <Item {...file} />;
						}}
					</For>
				</Show>
			</div>
			<Footer />
		</div>
	);
};
