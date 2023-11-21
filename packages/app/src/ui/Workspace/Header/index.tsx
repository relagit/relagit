import { JSX, Show, createEffect, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';
import RepositoryStore from '@app/stores/repository';
import { showErrorModal } from '@app/ui/Modal';
import { refetchRepository } from '@modules/actions';
import * as Git from '@modules/git';
import { debug, error } from '@modules/logger';
import { renderDate } from '@modules/time';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';

import Icon, { IconName, customIcons } from '@ui/Common/Icon';
import Tooltip from '@ui/Common/Tooltip';

import './index.scss';

export interface IPanelButtonProps {
	id: string;
	icon: IconName | keyof typeof customIcons;
	iconVariant?: 12 | 16 | 24 | 32;
	name?: string;
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
						aria-label={props.label || props.name}
						disabled={props.disabled}
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
	const repository = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getById(LocationStore.selectedRepository?.id)
	);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const blameOpen = createStoreListener([LocationStore], () => LocationStore.blameOpen);
	const [stashed, setStashed] = createSignal<number>(null);
	const [status, setStatus] = createSignal<'diverged' | 'ahead' | 'behind'>(null);

	createEffect(() => {
		if (!repository()) return;

		const ahead = repository()?.ahead || 0;
		const behind = repository()?.behind || 0;

		if (ahead > 0 && behind > 0) {
			setStatus('diverged');
		} else if (ahead > 0) {
			setStatus('ahead');
		} else if (behind > 0) {
			setStatus('behind');
		} else setStatus(null);
	});

	createStoreListener([LocationStore, RepositoryStore], async () => {
		try {
			const res = await Git.ListStash(LocationStore.selectedRepository);

			setStashed(res?.length);
		} catch (e) {
			showErrorModal(e, 'error.fetching');

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
						case 'diverged':
							return 'repo-forked';
						default:
							return 'repo';
					}
				})()}
				label={(() => {
					switch (status()) {
						case 'ahead':
							return t(
								'git.push',
								{ count: repository()?.ahead },
								repository()?.ahead
							);
						case 'behind':
							return t(
								'git.pull',
								{ count: repository()?.behind },
								repository()?.behind
							);
						case 'diverged':
							return t('git.diverged');
						default:
							return t('git.noChanges');
					}
				})()}
				id="workspace-pull"
				disabled={!repository() || status() === null}
				detail={(() => {
					const ahead = repository()?.ahead || 0;
					const behind = repository()?.behind || 0;

					switch (status()) {
						case 'ahead':
							return t('git.commits', { count: Math.abs(ahead) }, Math.abs(ahead));
						case 'behind':
							return t('git.commits', { count: Math.abs(behind) }, Math.abs(behind));
						case 'diverged':
							return t('git.divergedHint');
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
								showErrorModal(e, 'error.git');

								error(e);
							}

							refetchRepository(LocationStore.selectedRepository);
						}
						case 'behind': {
							debug('Pulling changes');

							try {
								await Git.Pull(LocationStore.selectedRepository);
							} catch (e) {
								showErrorModal(e, 'error.git');

								error(e);
							}

							refetchRepository(LocationStore.selectedRepository);
						}
						case 'diverged': {
							debug('Diverged');

							try {
								await Git.Stash(LocationStore.selectedRepository);

								await Git.Pull(LocationStore.selectedRepository);
							} catch (e) {
								showErrorModal(e, 'error.git');

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
							showErrorModal(e, 'error.git');

							error(e);
						}
					}}
					label={t('git.popStash')}
					detail={t('git.stashedChanges', { count: stashed() }, stashed())}
				/>
			</Show>
			<div class="workspace__header__spacer" />
			<PanelButton
				icon="git-commit"
				name="Toggle blame view"
				id="workspace-blame"
				className={blameOpen() ? 'active' : ''}
				onClick={() => {
					LocationStore.setBlameOpen(!blameOpen());
				}}
			/>
			<PanelButton
				icon="history"
				name="Toggle history"
				id="workspace-history"
				className={historyOpen() ? 'active' : ''}
				onClick={() => {
					LocationStore.setHistoryOpen(!historyOpen());
				}}
			/>
		</div>
	);
};
