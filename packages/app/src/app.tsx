import { Show, createSignal, onMount } from 'solid-js';

import { getRepositoryStatus } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import SettingsStore from '@stores/settings';

import Modal from '@ui/Modal';
import Notification from '@ui/Notification';
import Onboarding from '@ui/Onboarding';
import Sidebar from '@ui/Sidebar';
import Workspace from '@ui/Workspace';

import { Fetch } from './modules/git/fetch';
import { debug } from './modules/logger';
import { checkIsInPath } from './modules/shell';
import { registerAccelerators } from './native';
import LocationStore from './stores/location';
import OnboardingStore from './stores/onboarding';
import RepositoryStore from './stores/repository';

import './app.scss';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

export const queueRepositoryLoad = () => {
	debug('Queueing repository load');

	createStoreListener([SettingsStore], () => {
		for (const repo of SettingsStore.getSetting('repositories')) {
			if (SettingsStore.getSetting('activeRepository') === repo) continue;

			if (!fs.existsSync(repo)) {
				SettingsStore.setSetting(
					'repositories',
					SettingsStore.getSetting('repositories')?.filter((r) => r !== repo)
				);

				continue;
			}

			debug('Loading', repo);

			RepositoryStore.createDraft(repo);
		}

		debug('Emitting');
		RepositoryStore._emit();
	});
};

export default () => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);
	const onboarding = createStoreListener([OnboardingStore], () => OnboardingStore.state);
	const [sidebar, setSidebar] = createSignal(true);
	const [focused, setFocused] = createSignal(document.hasFocus());

	window.Native.listeners.SIDEBAR((_, value) => {
		setSidebar((o) => value ?? !o);
	});

	window.Native.listeners.FOCUS((_, value) => {
		setFocused(value);
	});

	registerAccelerators();

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
		if (SettingsStore.getSetting('activeRepository'))
			if (!fs.existsSync(SettingsStore.getSetting('activeRepository') || '')) {
				SettingsStore.setSetting(
					'repositories',
					SettingsStore.getSetting('repositories')?.filter(
						(r) => r !== SettingsStore.getSetting('activeRepository')
					)
				);

				SettingsStore.setSetting('activeRepository', null);

				return;
			}

		Fetch(SettingsStore.getSetting('activeRepository'));

		await getRepositoryStatus(SettingsStore.getSetting('activeRepository')!, true, true);

		LocationStore.setSelectedRepository(
			RepositoryStore.getByPath(SettingsStore.getSetting('activeRepository')!)
		);

		queueRepositoryLoad();
	});

	return (
		<>
			<div
				id="app-container"
				classList={{
					[`platform-${window.Native.platform}`]: true,
					[`theme-${settings()?.ui?.theme || 'system'}`]: true,
					vibrancy: !!settings()?.ui?.vibrancy,
					focused: focused(),
					unfocused: !focused()
				}}
				style={{
					'--settings-font-family': settings()?.ui?.fontFamily,
					'--settings-accent-color': settings()?.ui?.accentColor
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
					<Modal.Layer />
					<Notification.Layer />
					<Sidebar sidebar={sidebar()} />
					<Workspace sidebar={sidebar()} />
				</Show>
			</div>
		</>
	);
};
