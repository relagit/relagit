import NotificationStore from '@app/stores/notification';

import { NotificationProps } from '../../ui/Notification';

import { GithubRelease } from '../github';
import { t } from '../i18n';
import { log } from '../logger';
import { openExternal } from '../shell';
import { currentTag, getLatestRelease, getOTAData, semanticCompare } from './remote';

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

export const checkForOTANotifications = async () => {
	const otaData = await getOTAData();

	if (!otaData || !otaData.length) return;

	for (const data of otaData) {
		const notif = data;

		const id = NotificationStore.add({
			level: 'info',
			icon: 'bell',
			title: 'Notification',
			description: '',
			...notif,
			actions: notif.actions?.map(
				(
					action: NonNullable<NotificationProps['actions']>[number] & {
						href?: string;
					}
				) => ({
					...action,
					onClick: () => {
						if (action.href) {
							openExternal(action.href);
						}

						if (action.dismiss) {
							NotificationStore.remove(id);
						}
					}
				})
			)
		});
	}
};
