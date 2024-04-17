import { Accessor, For, JSX, Show, createEffect, createSignal } from 'solid-js';

import { Branch } from '@app/modules/git/branches';
import { t } from '@app/modules/i18n';
import { PassthroughRef } from '@app/shared';
import DraftStore from '@app/stores/draft';
import OnboardingStore from '@app/stores/onboarding';
import RemoteStore from '@app/stores/remote';
import RepositoryStore from '@app/stores/repository';
import SettingsStore from '@app/stores/settings';
import Popout from '@app/ui/Common/Popout';
import Menu from '@app/ui/Menu';
import { showErrorModal } from '@app/ui/Modal';
import { finishTour } from '@app/ui/Onboarding';
import { refetchRepository, triggerWorkflow } from '@modules/actions';
import * as Git from '@modules/git';
import { debug, error } from '@modules/logger';
import { renderDate } from '@modules/time';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';

import Icon, { IconName, customIcons } from '@ui/Common/Icon';
import Tooltip from '@ui/Common/Tooltip';
import { showPublishModal } from '@ui/Modal/Publish';

import './index.scss';

export interface PanelButtonProps {
	id: string;
	icon: IconName | keyof typeof customIcons;
	iconVariant?: 12 | 16 | 24;
	name?: string;
	onClick: (e: MouseEvent) => void;
	size?: 'small' | 'medium' | 'large';
	label?: string;
	detail?: JSX.Element | string;
	tooltip?: string;
	tooltipPosition?: 'top' | 'bottom' | 'auto';
	disabled?: boolean;
	className?: string;
	loading?: boolean;
}

const PanelButton = (props: PassthroughRef<PanelButtonProps>) => {
	return (
		<Tooltip text={props.tooltip || ''} position={props.tooltipPosition || 'auto'}>
			{(p) => {
				return (
					<button
						{...p}
						ref={props.ref}
						aria-role="button"
						aria-label={props.label || props.name}
						aria-selected={props.className?.includes('active')}
						disabled={props.loading || props.disabled}
						classList={{
							workspace__header__panelbutton: true,
							'workspace__header__panelbutton-small': props.size === 'small',
							'workspace__header__panelbutton-medium': props.size === 'medium',
							'workspace__header__panelbutton-large': props.size === 'large',
							disabled: props.disabled || props.loading,
							[props.className!]: true
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
						<Show when={props.loading}>
							<div class="workspace__header__panelbutton__loading"></div>
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
	const onboarding = createStoreListener([OnboardingStore], () => OnboardingStore.state);
	const onboardingStepState = createSignal(false);
	const [hasNewBranchInput, setHasNewBranchInput] = createSignal(false);
	const [newBranch, setNewBranch] = createSignal('');
	const [inputRef, setInputRef] = createSignal<HTMLElement>();
	const [branches, setBranches] = createSignal<Branch[] | null>(null);
	const [stashes, setStashes] = createSignal<Record<number, string[]> | null>(null);
	const [status, setStatus] = createSignal<'publish' | 'diverged' | 'ahead' | 'behind' | null>(
		null
	);
	const [actioning, setActioning] = createSignal(false);
	const [stashActioning, setStashActioning] = createSignal(false);
	const [previous, setPrevious] = createSignal<string | undefined>('');

	const fetching = createStoreListener(
		[LocationStore],
		() => LocationStore.isRefetchingSelectedRepository
	);

	const iconVariant = createStoreListener([SettingsStore], () => {
		return SettingsStore.getSetting('ui.thinIcons') ? 24 : 16;
	});

	let branchesRef: Accessor<HTMLElement | undefined>;

	window.Native.listeners.BRANCHES(() => {
		if (!branchesRef()) return;

		branchesRef()?.click();
	});

	createEffect(async () => {
		if (!repository()) return;

		const previous = await Git.PreviousCommit(repository());

		if (!previous) return setPrevious(undefined);

		setPrevious(previous);
	});

	createEffect(() => {
		if (onboarding()!.step === 4 && onboarding()!.dismissed !== true) {
			onboardingStepState[1](true);
		}
	});

	createEffect(() => {
		if (!repository()) return;

		if (!repository()?.remote && !RemoteStore.getByRepoPath(repository()?.path || '').length) {
			return setStatus('publish');
		}

		const ahead = repository()?.ahead || 0;
		const behind = repository()?.behind || 0;

		if (ahead === 0 && behind === 0) {
			const current = branches()?.find((b) => b.gitName === repository()?.branch);

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
			setStashes(null);
			setBranches(null);
		}

		try {
			const res = await Git.ListStash(LocationStore.selectedRepository!);

			setStashes(res);
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
				loading={fetching()}
				detail={renderDate(repository()?.lastFetched || new Date().getTime())()}
				label={t('git.sync')}
				icon="sync"
				iconVariant={iconVariant()}
				id="workspace-fetch-changes-and-remote"
				disabled={!repository()}
				onClick={() => {
					refetchRepository(LocationStore.selectedRepository);
				}}
			/>
			<Menu
				items={[
					status() === 'ahead' &&
						({
							label: t('git.undo', {
								sha: previous()?.substring(0, 7)
							}),
							onClick: async () => {
								if (!repository()) return;

								try {
									const previousDetails = await Git.Details(
										repository()?.path,
										previous() || 'HEAD^1'
									);

									// restore draft if it was removed
									if (
										!DraftStore.getDraft(repository()).message &&
										previousDetails?.message
									) {
										const message = previousDetails.message.split('\n')[0];
										const description = previousDetails.message
											.split('\n')
											.slice(1)
											.join('\n');

										DraftStore.setDraft(repository(), {
											message,
											description
										});
									}

									await Git.Reset(
										LocationStore.selectedRepository,
										await Git.PreviousCommit(repository(), previous())
									);

									refetchRepository(LocationStore.selectedRepository);
								} catch (e) {
									showErrorModal(e, 'error.git');

									error(e);
								}
							},
							type: 'item'
						} as const)
				].filter(Boolean)}
			>
				<PanelButton
					loading={actioning()}
					icon={((): IconName | keyof typeof customIcons => {
						switch (status()) {
							case 'ahead':
								return 'repo-push';
							case 'behind':
								return 'x-repo-pull';
							case 'publish':
								return 'repo-push';
							case 'diverged':
								return 'repo-forked';
							default:
								return 'repo';
						}
					})()}
					iconVariant={iconVariant()}
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
								return t(
									'git.commits',
									{ count: Math.abs(ahead) },
									Math.abs(ahead)
								);
							case 'behind':
								return t(
									'git.commits',
									{ count: Math.abs(behind) },
									Math.abs(behind)
								);
							case 'diverged':
								return t('git.divergedHint');
							case 'publish':
								return t('git.publishHint');
							default:
								return t('git.nothingToSee');
						}
					})()}
					onClick={async () => {
						if (!repository()) return;

						if (status() === null) return;

						setActioning(true);

						switch (status()) {
							case 'ahead': {
								debug('Pushing changes');

								try {
									await Git.Push(LocationStore.selectedRepository);

									triggerWorkflow('push', LocationStore.selectedRepository!);
								} catch (e) {
									showErrorModal(e, 'error.git');

									error(e);
								}

								setActioning(false);

								refetchRepository(LocationStore.selectedRepository);

								return;
							}
							case 'behind': {
								debug('Pulling changes');

								try {
									await Git.Pull(LocationStore.selectedRepository);
								} catch (e) {
									showErrorModal(e, 'error.git');

									error(e);
								}

								setActioning(false);

								refetchRepository(LocationStore.selectedRepository);

								return;
							}
							case 'diverged': {
								debug('Diverged');

								try {
									await Git.Stash(LocationStore.selectedRepository);

									triggerWorkflow('stash', LocationStore.selectedRepository!);

									await Git.Pull(LocationStore.selectedRepository);

									triggerWorkflow('pull', LocationStore.selectedRepository!);
								} catch (e) {
									showErrorModal(e, 'error.git');

									error(e);
								}

								setActioning(false);

								refetchRepository(LocationStore.selectedRepository);
								return;
							}
							case 'publish': {
								debug('Publishing');

								if (
									!repository()?.remote &&
									!RemoteStore.getByRepoPath(repository()?.path || '').length
								) {
									showPublishModal(repository());

									setActioning(false);

									return;
								}

								try {
									await Git.PushWithOrigin(
										LocationStore.selectedRepository,
										repository()?.branch
									);

									triggerWorkflow('push', LocationStore.selectedRepository!);
								} catch (e) {
									showErrorModal(e, 'error.git');

									error(e);
								}

								setActioning(false);
								refetchRepository(LocationStore.selectedRepository);

								return;
							}
							default: {
								return debug('No change');
							}
						}
					}}
				/>
			</Menu>
			<Show when={Object.keys(stashes() || {}).length > 0}>
				<Menu
					items={[
						{
							type: 'item',
							label: t('git.removeStash'),
							disabled: !repository(),
							onClick: async () => {
								if (!repository()) return;

								if (Object.keys(stashes() || {}).length === 0) return;

								setStashActioning(true);

								try {
									await Git.RemoveStash(LocationStore.selectedRepository, 0);

									setStashActioning(false);

									refetchRepository(LocationStore.selectedRepository);
								} catch (e) {
									showErrorModal(e, 'error.git');

									error(e);
								}
							}
						}
					]}
				>
					<PanelButton
						icon="file-directory"
						iconVariant={iconVariant()}
						id="workspace-pop-stash"
						onClick={async () => {
							if (!repository()) return;

							if (Object.keys(stashes() || {}).length === 0) return;

							setStashActioning(true);

							try {
								await Git.PopStash(LocationStore.selectedRepository, 0);

								triggerWorkflow('stash_pop', LocationStore.selectedRepository!);

								setStashActioning(false);

								refetchRepository(LocationStore.selectedRepository);
							} catch (e) {
								showErrorModal(e, 'error.git');

								error(e);
							}
						}}
						loading={stashActioning()}
						label={t('git.popStash')}
						detail={t(
							'git.stashedChanges',
							{
								stashCount: Object.keys(stashes()!).length,
								count: t(
									'git.files',
									{
										count: stashes()![0].length
									},
									stashes()![0].length
								)
							},
							Object.keys(stashes()!).length
						)}
					/>
				</Menu>
			</Show>
			<div class="workspace__header__spacer" />
			<Popout
				position="bottom"
				body={() => (
					<div class="branches-picker">
						<div class="branches-picker__label" tabIndex={0}>
							{t('git.branches', {}, branches()?.length)}
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
															branch.gitName
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
											aria-selected={branch.gitName === repository()?.branch}
											aria-role="option"
											aria-label={branch.gitName}
											classList={{
												'branches-picker__list__item': true,
												active: branch.gitName === repository()?.branch
											}}
											onClick={async () => {
												try {
													if (branch.gitName === repository()?.branch) {
														return;
													}

													await Git.Checkout(
														LocationStore.selectedRepository,
														branch.gitName
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
											<div class="branches-picker__list__item__name">
												<div class="branches-picker__list__item__name__path">
													{branch.path}
												</div>
												<div class="branches-picker__list__item__name__separator">
													{branch.path ? '/' : ''}
												</div>
												<div class="branches-picker__list__item__name__branch">
													{branch.name}
												</div>
											</div>
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

												if (newBranch() === repository()?.branch) {
													setNewBranch('');

													return;
												}

												if (
													branches()?.find(
														(b) => b.gitName === newBranch()
													)
												) {
													setNewBranch('');

													return;
												}

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

											if (!input?.value) return;

											if (input.value === repository()?.branch) {
												setNewBranch('');

												return;
											}

											if (
												branches()?.find((b) => b.gitName === input.value)
											) {
												setNewBranch('');

												return;
											}

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
							iconVariant={iconVariant()}
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
											active: onboarding()!.step === i
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
						iconVariant={iconVariant()}
						name="Toggle history"
						id="workspace-history"
						className={historyOpen() ? 'active' : ''}
						onClick={() => {
							if (onboardingStepState[0]()) {
								p.hide();

								OnboardingStore.setStep(5);

								finishTour();
							}

							LocationStore.setHistoryOpen(!historyOpen());
						}}
					/>
				)}
			</Popout>
		</div>
	);
};
