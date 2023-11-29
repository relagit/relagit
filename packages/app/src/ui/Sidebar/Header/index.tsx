import { Show, createSignal } from 'solid-js';

import { openInEditor } from '@app/modules/code';
import { t } from '@app/modules/i18n';
import { openExternal, showItemInFolder } from '@app/modules/shell';
import RemoteStore from '@app/stores/remote';
import SettingsStore from '@app/stores/settings';
import Menu from '@app/ui/Menu';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import RespositoryStore from '@stores/repository';

import Icon from '@ui/Common/Icon';

import Drawer from './Drawer';

import './index.scss';

export default () => {
	const [open, setOpen] = createSignal(false);
	const ref = createSignal<HTMLDivElement>();

	const toggle = (value: boolean) => {
		if (value) {
			setOpen(true);

			ref[0]().querySelector('button,input,a,select,textarea,[tabindex]')?.['focus']();
		} else {
			setOpen(false);
		}
	};

	window.Native.listeners.SWITCHER((_, value) => {
		toggle(value ?? !open());
	});

	const selected = createStoreListener([LocationStore, RespositoryStore], () =>
		RespositoryStore.getById(LocationStore.selectedRepository?.id)
	);

	return (
		<>
			<Drawer ref={ref} open={[open, toggle]} />
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
					aria-expanded={open()}
					tabIndex={0}
					class="sidebar__header"
					onClick={() => toggle(!open())}
					onKeyDown={(e) => {
						e.stopPropagation();
						e.preventDefault();

						if (e.key === 'Enter') {
							toggle(!open());
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
