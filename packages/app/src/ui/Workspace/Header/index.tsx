import { Accessor, For, JSX, Show, createEffect, createSignal } from 'solid-js';

import { Branch } from '@app/modules/git/branches';
import { t } from '@app/modules/i18n';
import OnboardingStore from '@app/stores/onboarding';
import RepositoryStore from '@app/stores/repository';
import Popout from '@app/ui/Common/Popout';
import Menu from '@app/ui/Menu';
import { showErrorModal } from '@app/ui/Modal';
import { PassthroughRef } from '@app/ui/shared';
import { refetchRepository, triggerWorkflow } from '@modules/actions';
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
	onClick: (e: MouseEvent) => void;
	size?: 'small' | 'medium' | 'large';
	label?: string;
	detail?: JSX.Element | string;
	tooltip?: string;
	tooltipPosition?: 'top' | 'bottom' | 'auto';
	disabled?: boolean;
	className?: string;
}

const PanelButton = (props: PassthroughRef<IPanelButtonProps>) => {
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
						ref={props.ref}
						aria-role="button"
						aria-label={props.label || props.name}
						aria-selected={props.className?.includes('active')}
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
	const onboarding = createStoreListener([OnboardingStore], () => OnboardingStore.state);
	const onboardingStepState = createSignal(false);
	const [hasNewBranchInput, setHasNewBranchInput] = createSignal(false);
	const [newBranch, setNewBranch] = createSignal('');
	const [inputRef, setInputRef] = createSignal<HTMLElement>();
	const [branches, setBranches] = createSignal<Branch[]>(null);
	const [stashed, setStashed] = createSignal<number>(null);
	const [status, setStatus] = createSignal<'publish' | 'diverged' | 'ahead' | 'behind'>(null);

	let branchesRef: Accessor<HTMLElement>;

	window.Native.listeners.BRANCHES(() => {
		if (!branchesRef()) return;

		branchesRef().click();
	});

	createEffect(() => {
		if (onboarding().step === 4 && onboarding().dismissed !== true) {
			onboardingStepState[1](true);
		}
	});

	createEffect(() => {
		if (!repository()) return;

		const ahead = repository()?.ahead || 0;
		const behind = repository()?.behind || 0;

		if (ahead === 0 && behind === 0) {
			const current = branches()?.find((b) => b.name === repository()?.branch);

			if (!current) return setStatus(null);

			if (!current.hasUpstream) {
				return setStatus('publish');
			} else {
				return setStatus(null);
			}
		}

		if (ahead > 0 && behind > 0) {
			setStatus('diverged');
		} else if (ahead > 0) {
			setStatus('ahead');
		} else if (behind > 0) {
			setStatus('behind');
		} else setStatus(null);
	});

	createStoreListener([LocationStore, RepositoryStore], async () => {
		if (!LocationStore.selectedRepository) {
			setStashed(null);
			setBranches(null);
		}

		try {
			const res = await Git.ListStash(LocationStore.selectedRepository);

			setStashed(res?.length);
		} catch (e) {
			showErrorModal(e, 'error.fetching');

			error(e);
		}

		try {
			const res = await Git.ListBranches(LocationStore.selectedRepository);

			setBranches(res);
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
						case 'publish':
							return 'repo-push';
						case 'diverged':
							return 'repo-forked';
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
						case 'publish':
							return t('git.publish');
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
						case 'publish':
							return t('git.publishHint');
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

								triggerWorkflow('push', LocationStore.selectedRepository);
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

								triggerWorkflow('stash', LocationStore.selectedRepository);

								await Git.Pull(LocationStore.selectedRepository);

								triggerWorkflow('pull', LocationStore.selectedRepository);
							} catch (e) {
								showErrorModal(e, 'error.git');

								error(e);
							}

							refetchRepository(LocationStore.selectedRepository);
						}
						case 'publish': {
							debug('Publishing');

							try {
								await Git.PushWithOrigin(
									LocationStore.selectedRepository,
									repository()?.branch
								);

								triggerWorkflow('push', LocationStore.selectedRepository);
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

							triggerWorkflow('stash_pop', LocationStore.selectedRepository);

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
			<Popout
				position="bottom"
				body={() => (
					<div class="branches-picker">
						<div class="branches-picker__label">
							{t('git.branches', null, branches()?.length)}
						</div>
						<div class="branches-picker__list">
							<For each={branches()}>
								{(branch) => (
									<Menu
										items={[
											{
												type: 'item',
												label: t('git.deleteBranch'),
												color: 'danger',
												onClick: async () => {
													try {
														await Git.DeleteBranch(
															LocationStore.selectedRepository,
															branch.name
														);

														refetchRepository(
															LocationStore.selectedRepository
														);
													} catch (e) {
														showErrorModal(e, 'error.git');

														error(e);
													}
												}
											}
										]}
									>
										<button
											aria-selected={branch.name === repository()?.branch}
											aria-role="option"
											aria-label={branch.name}
											classList={{
												'branches-picker__list__item': true,
												active: branch.name === repository()?.branch
											}}
											onClick={async () => {
												try {
													await Git.CheckoutBranch(
														LocationStore.selectedRepository,
														branch.name
													);

													refetchRepository(
														LocationStore.selectedRepository
													);
												} catch (e) {
													showErrorModal(e, 'error.git');

													error(e);
												}
											}}
										>
											{branch.name}
											<div class="branches-picker__list__item__info">
												{branch.relativeDate}
											</div>
										</button>
									</Menu>
								)}
							</For>
							<Show when={hasNewBranchInput()}>
								<div
									class="branches-picker__list__item branches-picker__list__item-new"
									ref={setInputRef}
								>
									<input
										type="text"
										placeholder="branch-name"
										inputmode="text"
										autocomplete="off"
										value={newBranch()}
										onInput={(e) => {
											setNewBranch(
												e.currentTarget.value
													.replace(/\s/g, '-')
													.replace(/[^a-zA-Z0-9-_/]/g, '')
											);

											e.currentTarget.value = newBranch();
										}}
										onKeyDown={async (e) => {
											if (e.key === 'Escape') {
												setHasNewBranchInput(false);
											}

											if (e.key === 'Enter') {
												if (!newBranch()) return;

												try {
													await Git.CreateBranch(
														LocationStore.selectedRepository,
														newBranch(),
														true
													);

													setHasNewBranchInput(false);

													refetchRepository(
														LocationStore.selectedRepository
													);
												} catch (e) {
													showErrorModal(e, 'error.git');

													error(e);
												}
											}
										}}
									/>
									<button
										class="branches-picker__list__item-new__hint"
										aria-label={t('git.createBranch')}
										aria-role="button"
										onClick={async () => {
											const input = inputRef()?.querySelector('input');

											if (!input.value) return;

											try {
												await Git.CreateBranch(
													LocationStore.selectedRepository,
													input.value,
													true
												);

												setHasNewBranchInput(false);

												refetchRepository(LocationStore.selectedRepository);
											} catch (e) {
												showErrorModal(e, 'error.git');

												error(e);
											}
										}}
									>
										↩
									</button>
								</div>
							</Show>
						</div>
						<button
							class="branches-picker__new"
							onClick={() => {
								setHasNewBranchInput((v) => !v);

								requestAnimationFrame(() => {
									inputRef()?.querySelector('input')?.focus();
								});
							}}
						>
							<Icon name={hasNewBranchInput() ? 'fold-up' : 'plus'} />
							{hasNewBranchInput() ? t('git.hide') : t('git.newBranch')}
						</button>
					</div>
				)}
			>
				{(p) => {
					branchesRef = p.getRef;

					return (
						<PanelButton
							disabled={!repository() || branches() === null}
							ref={p.ref}
							icon="git-branch"
							name="Switch branch"
							id="workspace-branch"
							className={p.open() ? 'active' : ''}
							onClick={(e) => {
								p.toggle(e);
							}}
						/>
					);
				}}
			</Popout>
			<PanelButton
				icon="people"
				name="Toggle blame view"
				id="workspace-blame"
				className={blameOpen() ? 'active' : ''}
				onClick={() => {
					LocationStore.setBlameOpen(!blameOpen());
				}}
			/>

			<Popout
				position="bottom"
				align="end"
				open={onboardingStepState}
				body={() => (
					<div class="onboarding-tooltip">
						<div class="onboarding-tooltip__title">
							{t('onboarding.history.tooltip')}
						</div>
						<div class="onboarding-tooltip__steps">
							<For each={[1, 2, 3, 4, 5]}>
								{(i) => (
									<div
										classList={{
											'onboarding-tooltip__step': true,
											active: onboarding().step === i
										}}
									/>
								)}
							</For>
						</div>
					</div>
				)}
			>
				{(p) => (
					<PanelButton
						ref={p.ref}
						icon="history"
						name="Toggle history"
						id="workspace-history"
						className={historyOpen() ? 'active' : ''}
						onClick={() => {
							if (onboardingStepState[0]()) {
								p.hide();

								OnboardingStore.setStep(5);
							}

							LocationStore.setHistoryOpen(!historyOpen());
						}}
					/>
				)}
			</Popout>
		</div>
	);
};
