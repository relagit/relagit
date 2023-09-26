import { createSignal, Show } from 'solid-js';

import { showItemInFolder } from '@app/modules/shell';
import { createStoreListener } from '@stores/index';
import RespositoryStore from '@stores/repository';
import LocationStore from '@stores/location';

import Icon from '@ui/Common/Icon';
import Menu from '@app/ui/Menu';
import Drawer from './Drawer';

import './index.scss';

export default () => {
	const [open, setOpen] = createSignal(false);

	window.Native.listeners.SWITCHER((_, value) => {
		setOpen((o) => value ?? !o);
	});

	const selected = createStoreListener([LocationStore, RespositoryStore], () =>
		RespositoryStore.getByName(LocationStore.selectedRepository?.name)
	);

	return (
		<>
			<Drawer open={[open, setOpen]} />
			<Menu
				items={[
					{
						type: 'item',
						label: `View in ${
							window.Native.platform === 'darwin' ? 'Finder' : 'Explorer'
						}`,
						onClick: () => {
							showItemInFolder(selected().path);
						},
						disabled: !selected()
					},
					{
						label: 'Open in Code',
						disabled: !selected(),
						type: 'item'
					}
				]}
			>
				<div
					aria-role="button"
					aria-label="Open Repository Drawer"
					tabIndex={0}
					class="sidebar__header"
					onClick={() => setOpen(!open())}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							setOpen(!open());
						}
					}}
				>
					<div class="sidebar__header__info">
						<div class="sidebar__header__repository">
							{selected()?.name || 'No Repository Selected'}
						</div>
						<div class="sidebar__header__details">
							<Show
								when={selected()}
								fallback={<span>Choose one to get started.</span>}
							>
								<span class="sidebar__header__details__branch">
									{selected()?.branch || 'No Branch'}
								</span>
							</Show>
						</div>
					</div>
					<div
						class="sidebar__header__chevron"
						style={{ transform: `rotate(${open() ? 90 : -90}deg)` }}
					>
						<Icon name="chevron-down" />
					</div>
				</div>
			</Menu>
		</>
	);
};
