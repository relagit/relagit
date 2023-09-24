import { Show, createSignal } from 'solid-js';

import { getRepositoryStatus } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import RepositoryStore from '@stores/repository';
import SettingsStore from '@stores/settings';

import Workspace from '@ui/Workspace';
import Settings from '@ui/Settings';
import Sidebar from '@ui/Sidebar';
import Modal from '@ui/Modal';
import Layer from '@ui/Layer';

import './app.scss';

export default () => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);
	const [sidebar, setSidebar] = createSignal(true);

	window.Native.listeners.SIDEBAR((_, value) => {
		setSidebar((o) => value ?? !o);
	});

	createStoreListener([SettingsStore], async () => {
		for (const repo of SettingsStore.settings?.get('repositories') as string[]) {
			if (RepositoryStore.getByPath(repo)) continue;

			await getRepositoryStatus(repo, true, true);
		}
	});

	return (
		<>
			<div
				id="app-container"
				class={`platform-${window.Native.platform} theme-${
					settings()?.get('theme') || 'system'
				} ${settings()?.get('vibrancy') ? 'vibrancy' : ''}`}
				style={{
					'--settings-font-family': settings()?.get('fontFamily') as string,
					'--settings-accent-color': settings()?.get('accentColor') as string
				}}
			>
				<Show when={window.Native.platform === 'darwin'}>
					<div class="window-control-bar"></div>
				</Show>
				<Layer
					type={settings()?.get('expandedSettings') ? 'bare' : 'rich'}
					key="settings"
					dismissable
					transitions={Layer.Transitions.Fade}
				>
					<Settings />
				</Layer>
				<Modal.Layer />
				<Sidebar sidebar={sidebar()} />
				<Workspace sidebar={sidebar()} />
			</div>
		</>
	);
};
