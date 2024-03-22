import { Show, Signal, createEffect, createSignal } from 'solid-js';

import { generatePrompt, sendAIRequest } from '@app/modules/ai';
import { getUser } from '@app/modules/github';
import { t } from '@app/modules/i18n';
import DraftStore from '@app/stores/draft';
import RepositoryStore from '@app/stores/repository';
import StageStore from '@app/stores/stage';
import Icon from '@app/ui/Common/Icon';
import Tooltip from '@app/ui/Common/Tooltip';
import { refetchRepository, triggerWorkflow } from '@modules/actions';
import { CommitStyle, getCommitStyledMessage, validateCommitMessage } from '@modules/commits';
import * as Git from '@modules/git';
import * as logger from '@modules/logger';
import FileStore from '@stores/files';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import SettingsStore from '@stores/settings';

import Button from '@ui/Common/Button';
import TextArea from '@ui/Common/TextArea';
import { showErrorModal } from '@ui/Modal';

import './index.scss';

export default (props: { showingSignal: Signal<boolean> }) => {
	const [debouncedShowing, setDebouncedShowing] = props.showingSignal;
	const [error, setError] = createSignal(false);
	const [generating, setGenerating] = createSignal(false);
	const [genError, setGenError] = createSignal(false);

	const draft = createStoreListener([DraftStore, LocationStore], () =>
		DraftStore.getDraft(LocationStore.selectedRepository)
	);
	const changes = createStoreListener([FileStore, LocationStore], () =>
		FileStore.getByRepositoryPath(LocationStore.selectedRepository?.path)
	);
	const staged = createStoreListener([FileStore, LocationStore], () =>
		StageStore.hasStagedFiles(LocationStore.selectedRepository?.path)
	);
	const selected = createStoreListener([LocationStore, RepositoryStore], () =>
		RepositoryStore.getById(LocationStore.selectedRepository?.id)
	);
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

	const dangerous = createStoreListener([SettingsStore, LocationStore, FileStore], () => {
		const files = StageStore.getStagedFilePaths(LocationStore.selectedRepository?.path);

		if (!files?.length) return false;

		const DANGEROUS = [/.*\.ENV/, /.*\.env/, /.*\.pem/, /.*\.key/, /.*\.pub/];

		return files?.some((file) => DANGEROUS.some((regex) => regex.test(file)));
	});

	const commitMessage = createStoreListener([SettingsStore, LocationStore, FileStore], () => {
		const files = StageStore.getStagedFilePaths(LocationStore.selectedRepository?.path)?.map(
			(f) => f.replaceAll('\\', '"').replace(/(^")|("$)/g, '')
		);

		if (!files?.length) return { message: '', style: CommitStyle.none };

		const style = settings()?.commit?.styles?.[LocationStore.selectedRepository?.path || ''];

		if (!style) return { message: '', style: CommitStyle.none };

		const message = getCommitStyledMessage(
			{ files },
			style,
			settings()?.commit?.preferParens
		)?.message;

		return { message, style } as const;
	});

	let timeout: ReturnType<typeof setTimeout>;

	createEffect(() => {
		// do not remove, compiler needs this
		(() => !(selected() && changes() && staged()))();

		clearTimeout(timeout);

		timeout = setTimeout(() => {
			if (LocationStore.isRefetchingSelectedRepository) return;

			setDebouncedShowing((selected() && changes() && staged()) || false);
		}, 500);
	});

	return (
		<div
			classList={{
				sidebar__footer: true,
				showing: debouncedShowing()
			}}
		>
			<TextArea
				label={t('sidebar.footer.summary')}
				disabled={!(selected() && changes() && staged()) || generating()}
				value={draft()?.message || ''}
				placeholder={commitMessage()?.message || t('sidebar.footer.summary')}
				onChange={(value) => {
					if (
						settings()?.commit?.enforceStyle === true &&
						commitMessage()?.style !== 'none'
					) {
						const allowed = validateCommitMessage(value, commitMessage()?.style);

						if (allowed) {
							setError(false);

							DraftStore.setDraft(LocationStore.selectedRepository, {
								message: value,
								description: draft()?.description || ''
							});
						} else {
							setError(true);

							DraftStore.setDraft(LocationStore.selectedRepository, {
								message: value,
								description: draft()?.description || ''
							});
						}
					} else {
						setError(false);

						DraftStore.setDraft(LocationStore.selectedRepository, {
							message: value,
							description: draft()?.description || ''
						});
					}
				}}
				onContextMenu={() => {
					if (draft()?.message.length) return;

					DraftStore.setDraft(LocationStore.selectedRepository, {
						message: commitMessage()?.message || '',
						description: draft()?.description || ''
					});
				}}
				onKeyDown={(e) => {
					if (e.shiftKey && e.key === 'Enter') {
						e.preventDefault();

						if (draft()?.message.length) return;

						DraftStore.setDraft(LocationStore.selectedRepository, {
							message: commitMessage()?.message || '',
							description: draft()?.description || ''
						});
					}
				}}
			/>
			<TextArea
				label={t('sidebar.footer.description')}
				disabled={!(selected() && changes() && staged()) || generating()}
				value={draft()?.description || ''}
				placeholder={t('sidebar.footer.description')}
				onChange={(value) => {
					DraftStore.setDraft(LocationStore.selectedRepository, {
						message: draft()?.message || '',
						description: value
					});
				}}
				footer={
					<>
						<Tooltip text={t('sidebar.footer.autogenerate')}>
							{(p) => (
								<button
									{...p}
									class="sidebar__footer__textarea__button"
									aria-label={t('sidebar.footer.autogenerate')}
									disabled={
										!(selected() && changes() && staged()) || generating()
									}
									onClick={async () => {
										setGenerating(true);
										setGenError(false);

										try {
											for await (const val of sendAIRequest(
												await generatePrompt(selected()!)
											)) {
												if (!val) continue;

												DraftStore.setDraft(
													LocationStore.selectedRepository,
													{
														message: val.message,
														description:
															val.body ||
															DraftStore.getDraft(
																LocationStore.selectedRepository
															).description
													}
												);
											}

											setGenerating(false);
										} catch (e) {
											setGenError(true);

											return setGenerating(false);
										}
									}}
								>
									<Show
										when={generating()}
										fallback={
											<Show
												when={!genError()}
												fallback={<Icon name="alert" />}
											>
												<Icon name="sparkle-fill" />
											</Show>
										}
									>
										<svg
											viewBox="0 0 38 38"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
											role="img"
											stroke="currentColor"
											width={14}
											height={14}
										>
											<g fill="none" fill-rule="evenodd">
												<g transform="translate(1 1)" stroke-width="2">
													<circle
														stroke-opacity=".5"
														cx="18"
														cy="18"
														r="18"
													/>
													<path d="M36 18c0-9.94-8.06-18-18-18">
														<animateTransform
															attributeName="transform"
															type="rotate"
															from="0 18 18"
															to="360 18 18"
															dur="1s"
															repeatCount="indefinite"
														/>
													</path>
												</g>
											</g>
										</svg>
									</Show>
								</button>
							)}
						</Tooltip>
					</>
				}
				expanded={true}
			/>
			<Tooltip
				text={
					dangerous()
						? t('sidebar.footer.dangerous')
						: t('sidebar.footer.committedBy', {
								user: getUser()?.login || 'Unknown'
							})
				}
			>
				{(props) => (
					<Button
						dedupe
						rest={props}
						label={t('sidebar.footer.commit', {
							branch: selected()?.branch || 'Remote'
						})}
						type={error() || dangerous() ? 'danger' : 'brand'}
						onClick={async () => {
							LocationStore.setSelectedFile(undefined);

							try {
								triggerWorkflow('commit', selected()!, draft()!);

								await Git.Commit(
									selected()!,
									draft()?.message,
									draft()?.description
								);
							} catch (e) {
								showErrorModal(e, 'error.git');

								logger.error(e);

								return;
							}

							DraftStore.setDraft(LocationStore.selectedRepository, {
								message: '',
								description: ''
							});

							await refetchRepository(selected());
						}}
						disabled={!draft()?.message.length}
					>
						{t('sidebar.footer.commit', {
							branch: selected()?.branch || 'Remote'
						})}
					</Button>
				)}
			</Tooltip>
		</div>
	);
};
