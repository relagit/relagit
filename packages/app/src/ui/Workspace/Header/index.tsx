import { JSX, Show, createEffect, createSignal } from 'solid-js';

import { refetchRepository } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import { debug, error } from '@modules/logger';
import LocationStore from '@stores/location';
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
							disabled: props.disabled
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
	const [status, setStatus] = createSignal<string>(null);

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
							return 'Push Changes';
						case 'behind':
							return 'Pull Changes';
						default:
							return 'No Changes';
					}
				})()}
				id="workspace-pull"
				disabled={!repository() || status() === null}
				detail={(() => {
					const aob = repository()?.aheadOrBehind || 0;

					switch (status()) {
						case 'ahead':
							return `${aob} commit${aob > 1 ? 's' : ''}`;
						case 'behind':
							return `${Math.abs(aob)} commit${Math.abs(aob) > 1 ? 's' : ''}`;
						default:
							return 'Nothing to see here';
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
						}
						default: {
							debug('No change');
						}
					}
				}}
			/>
			<div class="workspace__header__spacer" />
			<PanelButton
				icon={historyOpen() ? 'code' : 'history'}
				id="workspace-history"
				onClick={() => {
					LocationStore.setHistoryOpen(!historyOpen());
				}}
			/>
		</div>
	);
};
