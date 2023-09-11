import { JSX, Show } from 'solid-js';

import { refetchRepository } from '@modules/actions';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import { renderDate } from '@modules/time';
import { debug } from '@modules/logger';
import * as Git from '@modules/git';

import Icon, { IconName, customIcons } from '@ui/Common/Icon';
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
					const aob = repository()?.aheadOrBehind || 0;

					if (aob < 0) {
						return 'cPull';
					}

					if (aob > 0) {
						return 'repo-push';
					}

					return 'repo';
				})()}
				label={(() => {
					const aob = repository()?.aheadOrBehind || 0;

					if (aob < 0) {
						return 'Pull Changes';
					}

					if (aob > 0) {
						return 'Push Changes';
					}

					return 'No Changes';
				})()}
				id="workspace-pull"
				disabled={!repository()?.aheadOrBehind}
				detail={(() => {
					const aob = repository()?.aheadOrBehind || 0;

					if (!aob) {
						return 'Nothing to see here';
					}

					if (aob > 0) {
						return `${aob} commit${aob > 1 ? 's' : ''}`;
					}

					if (aob < 0) {
						return `${Math.abs(aob)} commit${Math.abs(aob) > 1 ? 's' : ''}`;
					}

					return 'Nothing to see here';
				})()}
				onClick={async () => {
					const aob = repository()?.aheadOrBehind || 0;

					if (aob < 0) {
						return debug('Pulling changes');
					}

					if (aob > 0) {
						debug('Pushing changes');

						await Git.Push(LocationStore.selectedRepository);

						return refetchRepository(LocationStore.selectedRepository);
					}
				}}
			/>
			<div class="workspace__header__spacer" />
		</div>
	);
};
