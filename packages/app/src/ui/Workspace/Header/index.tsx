import { JSX, Show, createEffect, createSignal } from 'solid-js';

import { refetchRepository } from '@modules/actions';
import RepositoryStore from '@app/stores/repository';
import { createStoreListener } from '@stores/index';
import { debug, error } from '@modules/logger';
import LocationStore from '@stores/location';
import { useI18n } from '@app/modules/i18n';
import { renderDate } from '@modules/time';
import * as Git from '@modules/git';

import Icon, { IconName, customIcons } from '@ui/Common/Icon';
import { showErrorModal } from '@app/ui/Modal';
import Tooltip from '@ui/Common/Tooltip';

import './index.scss';

export interface IPanelButtonProps {
	id: string;
	icon: IconName | keyof typeof customIcons;
	iconVariant?: 12 | 16 | 24 | 32;
	onClick: () => void;
	size?: 'small' | 'medium' | 'large';
	label?: string;
	detail?: JSX.Element | string;
	tooltip?: string;
	tooltipPosition?: 'top' | 'bottom' | 'auto';
	disabled?: boolean;
	className?: string;
}

const PanelButton = (props: IPanelButtonProps) => {
	return (
		<Tooltip text={props.tooltip} position={props.tooltipPosition || 'auto'}>
			{(p) => {
				if (!props.tooltip) {
					// @ts-expect-error - we are just removing the tooltip props
					p = {};
				}

				return (
					<button
						{...p}
						aria-role="button"
						aria-label={props.label}
						classList={{
							workspace__header__panelbutton: true,
							'workspace__header__panelbutton-small': props.size === 'small',
							'workspace__header__panelbutton-medium': props.size === 'medium',
							'workspace__header__panelbutton-large': props.size === 'large',
							disabled: props.disabled,
							[props.className]: true
						}}
						onClick={props.onClick}
						id={props.id}
					>
						<Icon name={props.icon} variant={props.iconVariant} />
						<Show when={props.label || props.detail}>
							<div class="workspace__header__panelbutton__info">
								{props.label && (
									<div class="workspace__header__panelbutton__info__label">
										{props.label}
									</div>
								)}
								{props.detail && (
									<div class="workspace__header__panelbutton__info__detail">
										{props.detail}
									</div>
								)}
							</div>
						</Show>
					</button>
				);
			}}
		</Tooltip>
	);
};

export default () => {
	const repository = createStoreListener([LocationStore], () => LocationStore.selectedRepository);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const [stashed, setStashed] = createSignal<number>(null);
	const [status, setStatus] = createSignal<string>(null);

	const t = useI18n();

	createEffect(() => {
		if (!repository()) return;

		const aob = repository()?.aheadOrBehind || 0;

		if (aob < 0) {
			return setStatus('behind');
		}

		if (aob > 0) {
			return setStatus('ahead');
		}

		setStatus(null);
	});

	createStoreListener([LocationStore, RepositoryStore], async () => {
		try {
			const res = await Git.ListStash(LocationStore.selectedRepository);

			setStashed(res?.length);
		} catch (e) {
			showErrorModal(e, 'Unknown error while fetching repository status');

			error(e);
		}
	});

	return (
		<div class="workspace__header">
			<PanelButton
				detail={renderDate(repository()?.lastFetched)()}
				label="Sync"
				icon="sync"
				id="workspace-fetch-changes-and-remote"
				disabled={repository() ? false : true}
				onClick={() => {
					refetchRepository(LocationStore.selectedRepository);
				}}
			/>
			<PanelButton
				icon={((): IconName | keyof typeof customIcons => {
					switch (status()) {
						case 'ahead':
							return 'repo-push';
						case 'behind':
							return 'cPull';
						default:
							return 'repo';
					}
				})()}
				label={(() => {
					switch (status()) {
						case 'ahead':
							return t('git.pushChanges');
						case 'behind':
							return t('git.pullChanges');
						default:
							return t('git.noChanges');
					}
				})()}
				id="workspace-pull"
				disabled={!repository() || status() === null}
				detail={(() => {
					const aob = repository()?.aheadOrBehind || 0;

					switch (status()) {
						case 'ahead':
						case 'behind':
							return t('git.commits', { count: Math.abs(aob) }, Math.abs(aob));
						default:
							return t('git.nothingToSee');
					}
				})()}
				onClick={async () => {
					switch (status()) {
						case 'ahead': {
							debug('Pushing changes');

							try {
								await Git.Push(LocationStore.selectedRepository);
							} catch (e) {
								showErrorModal(e, 'Unknown error while pushing changes');

								error(e);
							}

							refetchRepository(LocationStore.selectedRepository);
						}
						case 'behind': {
							debug('Pulling changes');

							try {
								await Git.Pull(LocationStore.selectedRepository);
							} catch (e) {
								showErrorModal(e, 'Unknown error while pulling from remote');

								error(e);
							}

							refetchRepository(LocationStore.selectedRepository);
						}
						default: {
							debug('No change');
						}
					}
				}}
			/>
			<Show when={stashed() > 0}>
				<PanelButton
					icon="file-directory"
					id="workspace-pop-stash"
					onClick={async () => {
						try {
							await Git.PopStash(LocationStore.selectedRepository);

							refetchRepository(LocationStore.selectedRepository);
						} catch (e) {
							showErrorModal(e, 'Unknown error while popping stash');

							error(e);
						}
					}}
					label={t('git.popStash')}
					detail={t('git.stashedChanges', { count: stashed() }, stashed())}
				/>
			</Show>
			<div class="workspace__header__spacer" />
			<PanelButton
				icon="history"
				id="workspace-history"
				className={historyOpen() ? 'active' : ''}
				onClick={() => {
					LocationStore.setHistoryOpen(!historyOpen());
				}}
			/>
		</div>
	);
};
