const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import { Show, createSignal, onMount } from 'solid-js';

import { getRepositoryStatus } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import SettingsStore from '@stores/settings';
import { debug } from './modules/logger';
import { Git } from './modules/git/core';

import Workspace from '@ui/Workspace';
import Settings from '@ui/Settings';
import Sidebar from '@ui/Sidebar';
import Modal from '@ui/Modal';
import Layer from '@ui/Layer';

import './app.scss';

const loaded = [];

export default () => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);
	const [sidebar, setSidebar] = createSignal(true);
	const [focused, setFocused] = createSignal(false);

	window.Native.listeners.SIDEBAR((_, value) => {
		setSidebar((o) => value ?? !o);
	});

	window.Native.listeners.FOCUS((_, value) => {
		setFocused(value);
	});

	onMount(async () => {
		// we want to load the active repository first to decrease the time to load the app
		if (
			SettingsStore.settings?.get('activeRepository') &&
			!loaded.includes(SettingsStore.settings?.get('activeRepository') as string)
		)
			if (!fs.existsSync(SettingsStore.settings?.get('activeRepository') as string)) {
				SettingsStore.settings?.set(
					'repositories',
					(SettingsStore.settings?.get('repositories') as string[])?.filter(
						(r) => r !== SettingsStore.settings?.get('activeRepository')
					)
				);

				SettingsStore.settings?.set('activeRepository', null);

				return;
			}

		await getRepositoryStatus(
			SettingsStore.settings?.get('activeRepository') as string,
			true,
			true
		);
	});

	createStoreListener([SettingsStore], async () => {
		for (const repo of SettingsStore.settings?.get('repositories') as string[]) {
			if (loaded.includes(repo)) continue;

			debug('Loading', repo);

			if (!fs.existsSync(repo)) {
				SettingsStore.settings?.set(
					'repositories',
					(SettingsStore.settings?.get('repositories') as string[])?.filter(
						(r) => r !== repo
					)
				);

				continue;
			}

			loaded.push(repo);

			Git({
				directory: repo,
				command: 'fetch',
				args: []
			});

			await getRepositoryStatus(repo, true, true);
		}
	});

	return (
		<>
			<div
				id="app-container"
				class={`platform-${window.Native.platform} theme-${
					settings()?.get('theme') || 'system'
				} ${settings()?.get('vibrancy') ? 'vibrancy' : ''} ${
					focused() ? 'focused' : 'unfocused'
				}`}
				style={{
					'--settings-font-family': settings()?.get('fontFamily') as string,
					'--settings-accent-color': settings()?.get('accentColor') as string
				}}
			>
				<Show
					when={window.Native.platform === 'darwin' || window.Native.platform === 'win32'}
				>
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
