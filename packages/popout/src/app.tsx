import { createSignal, onMount } from 'solid-js';

import { getRepositoryStatus } from '@app/modules/actions/files';
import type { RecursivePartial } from '@app/shared';
import { createStoreListener } from '@app/stores';
import SettingsStore, { type Settings } from '@app/stores/settings';
import { Fetch } from '~/app/src/modules/git/fetch';
import LocationStore from '~/app/src/stores/location';
import RepositoryStore from '~/app/src/stores/repository';
import * as ipc from '~/common/ipc';

import Content from './ui/Content';
import PanelButton from './ui/PanelButton';

import './app.scss';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');
const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

const iconFrom = (
	position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | undefined
) => {
	switch (position) {
		case 'top-left':
			return '􀭳';
		case 'top-right':
			return '􀭴';
		case 'bottom-left':
			return '􀭵';
		case 'bottom-right':
			return '􀭶';
		default:
			return '􀭴';
	}
};

const loaded: string[] = [];

const queueRepositoryLoad = () => {
	createStoreListener([SettingsStore], () => {
		for (const repo of SettingsStore.getSetting('repositories')) {
			if (SettingsStore.getSetting('activeRepository') === repo) continue;

			if (loaded.includes(repo)) continue;

			if (!fs.existsSync(repo)) {
				SettingsStore.setSetting(
					'repositories',
					SettingsStore.getSetting('repositories')?.filter((r) => r !== repo)
				);

				continue;
			}

			loaded.push(repo);

			Fetch(repo);

			getRepositoryStatus(repo, true, true);
		}
	});
};

export default () => {
	const settings = createStoreListener<RecursivePartial<Settings>>(
		[SettingsStore],
		() => SettingsStore.settings
	);

	const repo = createStoreListener([LocationStore], () => {
		return RepositoryStore.getByPath(settings()?.activeRepository || '');
	});

	onMount(async () => {
		await getRepositoryStatus(settings()?.activeRepository || '', true, true);

		LocationStore.setSelectedRepository(
			RepositoryStore.getByPath(settings()?.activeRepository || '')
		);

		loaded.push(settings()?.activeRepository || '');

		queueRepositoryLoad();
	});

	const [expanded, setExpanded] = createSignal(false);

	return (
		<>
			<div
				id="popout-container"
				classList={{
					[`platform-${window.Native.platform}`]: true,
					[`theme-${settings()?.ui?.theme || 'system'}`]: true
				}}
				style={{
					'--settings-font-family': settings()?.ui?.fontFamily,
					'--settings-accent-color': settings()?.ui?.accentColor
				}}
			>
				<PanelButton
					icon="􀆄"
					title="Close"
					onClick={() => {
						ipcRenderer.send(ipc.POPOUT_CLOSE);
					}}
					position="top-right"
				/>
				<PanelButton
					icon={expanded() ? '􀥞' : '􀤴'}
					title={expanded() ? 'Collapse' : 'Expand'}
					position="bottom-right"
					margin={true}
					onClick={() => setExpanded(!expanded())}
				/>
				<PanelButton
					icon={iconFrom(settings()?.popout?.position)}
					title="Position"
					items={[
						{
							icon: iconFrom('top-left'),
							id: 'top-left'
						},
						{
							icon: iconFrom('top-right'),
							id: 'top-right'
						},
						{
							icon: iconFrom('bottom-left'),
							id: 'bottom-left'
						},
						{
							icon: iconFrom('bottom-right'),
							id: 'bottom-right'
						}
					]}
					onItemSelect={(id) => {
						SettingsStore.setSetting('popout.position', id as 'top-left');

						ipcRenderer.invoke(ipc.POPOUT_REPOSITION, id);
					}}
					position="bottom-right"
				/>
				<Content expanded={expanded()} repo={repo()} />
			</div>
		</>
	);
};
