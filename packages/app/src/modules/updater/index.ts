import NotificationStore from '@app/stores/notification';

import { GithubRelease } from '../github';
import { t } from '../i18n';
import { log } from '../logger';
import { openExternal } from '../shell';
import { currentTag, getLatestRelease, semanticCompare } from './remote';

export const checkForUpdates = async () => {
	const latest = await getLatestRelease();

	if (!latest) return;

	const comparison = semanticCompare(latest.tag_name, currentTag);

	if (comparison === 'equal') {
		log('You are using the latest version of Relagit');
	} else {
		notifyUpdate(latest);
	}
};

const notifyUpdate = (release: GithubRelease) => {
	const id = NotificationStore.add({
		level: 'info',
		icon: 'tag',
		title: 'New version available',
		description: `A new version of Relagit is available: ${release.tag_name}`,
		actions: [
			{
				label: t('update.download'),
				children: t('update.download'),
				type: 'brand',
				onClick: () => openExternal('https://rela.dev/download')
			},
			{
				label: t('update.ignore'),
				children: t('update.ignore'),
				type: 'default',
				onClick: () => NotificationStore.remove(id)
			}
		]
	});
};
