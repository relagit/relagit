import { createSignal, Show } from 'solid-js';

import { openExternal, showItemInFolder } from '@app/modules/shell';
import { createStoreListener } from '@stores/index';
import RespositoryStore from '@stores/repository';
import RemoteStore from '@app/stores/remote';
import LocationStore from '@stores/location';
import { t } from '@app/modules/i18n';

import Icon from '@ui/Common/Icon';
import Menu from '@app/ui/Menu';
import Drawer from './Drawer';

import './index.scss';
import { openInEditor } from '@app/modules/code';
import SettingsStore from '@app/stores/settings';

export default () => {
	const [open, setOpen] = createSignal(false);

	window.Native.listeners.SWITCHER((_, value) => {
		setOpen((o) => value ?? !o);
	});

	const selected = createStoreListener([LocationStore, RespositoryStore], () =>
		RespositoryStore.getById(LocationStore.selectedRepository?.id)
	);

	return (
		<>
			<Drawer open={[open, setOpen]} />
			<Menu
				items={[
					{
						type: 'item',
						label: t('sidebar.contextMenu.viewIn', {
							name: window.Native.platform === 'darwin' ? 'Finder' : 'Explorer'
						}),
						onClick: () => {
							showItemInFolder(selected().path);
						},
						disabled: !selected()
					},
					{
						label: t('sidebar.contextMenu.openRemote'),
						disabled: !selected(),
						type: 'item',
						onClick: () => {
							const remotes = RemoteStore.getByRepoPath(selected().path);

							if (remotes[0]?.url) openExternal(remotes[0].url);
						}
					},
					{
						label: t('sidebar.contextMenu.openIn', {
							name: t(
								`settings.general.editor.${
									SettingsStore.getSetting('externalEditor') || 'code'
								}`
							)
						}),
						onClick: () => {
							openInEditor(selected()?.path);
						},
						disabled: !selected(),
						type: 'item'
					}
				]}
			>
				<div
					aria-role="button"
					aria-label={t('sidebar.openDrawer')}
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
							{selected()?.name || t('sidebar.noRepo')}
						</div>
						<div class="sidebar__header__details">
							<Show
								when={selected()}
								fallback={<span>{t('sidebar.noRepoHint')}</span>}
							>
								<span class="sidebar__header__details__branch">
									{selected()?.branch || t('sidebar.noBranch')}
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
