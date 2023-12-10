import { Show, createSignal, onMount } from 'solid-js';

import { getRepositoryStatus } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import SettingsStore from '@stores/settings';

import Layer from '@ui/Layer';
import Modal from '@ui/Modal';
import Onboarding from '@ui/Onboarding';
import Settings from '@ui/Settings';
import Sidebar from '@ui/Sidebar';
import Workspace from '@ui/Workspace';

import { Git } from './modules/git/core';
import { debug } from './modules/logger';
import { checkIsInPath } from './modules/shell';
import LocationStore from './stores/location';
import OnboardingStore from './stores/onboarding';
import RepositoryStore from './stores/repository';

import './app.scss';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

const loaded = [];

export const queueRepositoryLoad = () => {
	debug('Queueing repository load');

	createStoreListener([SettingsStore], () => {
		for (const repo of SettingsStore.getSetting('repositories') as string[]) {
			if (SettingsStore.getSetting('activeRepository') === repo) continue;

			if (loaded.includes(repo)) continue;

			debug('Loading', repo);

			if (!fs.existsSync(repo)) {
				SettingsStore.settings?.set(
					'repositories',
					(SettingsStore.getSetting('repositories') as string[])?.filter(
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

			getRepositoryStatus(repo, true, true);
		}
	});
};

export default () => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);
	const onboarding = createStoreListener([OnboardingStore], () => OnboardingStore.state);
	const [sidebar, setSidebar] = createSignal(true);
	const [focused, setFocused] = createSignal(false);

	window.Native.listeners.SIDEBAR((_, value) => {
		setSidebar((o) => value ?? !o);
	});

	window.Native.listeners.FOCUS((_, value) => {
		setFocused(value);
	});

	onMount(async () => {
		document.documentElement.setAttribute('lang', SettingsStore.getSetting('locale'));

		// check if git is installed
		if (!(await checkIsInPath('git'))) {
			window.Native.alert(
				'Git is not found.\n\nPlease install Git and restart the app.',
				'warning'
			);

			window.Native.quit();
		}

		// we want to load the active repository first to decrease the time to load the app
		if (
			SettingsStore.getSetting('activeRepository') &&
			!loaded.includes(SettingsStore.getSetting('activeRepository'))
		)
			if (!fs.existsSync(SettingsStore.getSetting('activeRepository'))) {
				SettingsStore.settings?.set(
					'repositories',
					SettingsStore.getSetting('repositories')?.filter(
						(r) => r !== SettingsStore.getSetting('activeRepository')
					)
				);

				SettingsStore.settings?.set('activeRepository', null);

				return;
			}

		await getRepositoryStatus(SettingsStore.getSetting('activeRepository'), true, true);

		LocationStore.setSelectedRepository(
			RepositoryStore.getByPath(SettingsStore.getSetting('activeRepository'))
		);

		queueRepositoryLoad();
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
					when={onboarding()?.step !== 0 || onboarding()?.dismissed}
					fallback={<Onboarding />}
				>
					<Show
						when={
							window.Native.platform === 'darwin' ||
							window.Native.platform === 'win32'
						}
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
				</Show>
			</div>
		</>
	);
};
