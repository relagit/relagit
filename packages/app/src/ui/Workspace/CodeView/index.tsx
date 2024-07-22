import type { AddedLine, DeletedLine, GitDiff } from 'parse-git-diff';
import { For, JSX, Show, createSignal } from 'solid-js';

import { GitStatus } from '@app/modules/git/diff';
import { parseDiff } from '@app/modules/git/parse-diff';
import { t } from '@app/modules/i18n';
import { emailToIconURL } from '@app/modules/oauth';
import { relative } from '@app/modules/time';
import Tooltip from '@app/ui/Common/Tooltip';
import * as Git from '@modules/git';
import { DIFF } from '@modules/git/constants';
import highlighter, { langFrom } from '@modules/highlighter';
import { error } from '@modules/logger';
import { useLazy } from '@modules/shared';
import FileStore from '@stores/files';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import { editors, openInEditor } from '~/app/src/modules/editor';
import {
	GitHub,
	getProvider,
	issuesUrlForProvider,
	pullRequestsUrlForProvider,
	repoParams
} from '~/app/src/modules/github';
import { openExternal } from '~/app/src/modules/shell';
import SettingsStore from '~/app/src/stores/settings';

import EmptyState from '@ui/Common/EmptyState';
import Icon from '@ui/Common/Icon';

import ImageView from './ImageView';
import SubmoduleView from './SubmoduleView';
import { BINARY_EXTENSIONS, IMAGE_EXTENSIONS } from './constants';

import './index.scss';

const meta = window.Native.platform === 'win32' ? '⌃' : '⌘';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');

type GitBlame = Awaited<ReturnType<(typeof Git)['Blame']>>;

const extname = (file: string | undefined) => {
	if (!file) return '';

	return file?.split('.').length > 1 ? `.${file.split('.').pop()}` : file;
};

const totalLines = (file: string | GitDiff['files'][number]) => {
	if (!file) {
		return 0;
	}

	if (typeof file === 'string') {
		return file.split('\n').length;
	}

	return file?.chunks?.reduce((acc, curr) => {
		return acc + curr.changes.length;
	}, 0);
};

const status = (e: 'UnchangedLine' | 'AddedLine' | 'DeletedLine') => {
	switch (e) {
		case 'UnchangedLine':
			return 'unchanged';
		case 'AddedLine':
			return 'added';
		case 'DeletedLine':
			return 'deleted';
	}
};

export interface CodeViewProps {
	file: string;
	status: GitStatus;
	repository: string;
	fromFile?: string;
}

const dealWithTabs = (line: string) => {
	return line.replaceAll(/(?<!\S)(\t|  )/g, '<span class="pl-tab">  </span>');
};

const BlameIndicator = (props: {
	blame?: GitBlame[number];
	children: (p: {
		onMouseEnter: (e: MouseEvent) => void;
		onMouseLeave: () => void;
		onFocus: (e: FocusEvent) => void;
		onBlur: () => void;
		tabIndex: number;
		'aria-labelledby': string;
	}) => JSX.Element;
}) => (
	<Tooltip
		delay={1000}
		text={
			<Show when={props.blame}>
				<div class="blame-tooltip">
					<div class="blame-tooltip__commit">
						<div class="blame-tooltip__commit__info">
							{props.blame!.message}
							<span class="blame-tooltip__commit__info__hash">
								{props.blame!.hash?.slice(0, 7)}
							</span>
						</div>
						<div class="blame-tooltip__commit__changes">{props.blame!.changes}</div>
					</div>
					<div class="blame-tooltip__footer">
						<div class="blame-tooltip__footer__author">
							<Show when={emailToIconURL(props.blame!.email)}>
								<img
									src={emailToIconURL(props.blame!.email)!}
									alt={props.blame!.author}
									class="blame-tooltip__footer__author__icon"
								/>
							</Show>
							{props.blame!.author}
						</div>
						<div class="blame-tooltip__footer__date">
							{relative(new Date(props.blame!.date).getTime())}
							{` (${new Date(props.blame!.date).toLocaleString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
								hour: 'numeric',
								minute: 'numeric'
							})})`}
						</div>
					</div>
				</div>
			</Show>
		}
		size="expanded"
	>
		{props.children}
	</Tooltip>
);

export default (props: CodeViewProps) => {
	const [showOverridden, setShowOverridden] = createSignal<boolean>(false);
	const [shouldShow, setShouldShow] = createSignal<boolean>(false);
	const [diff, setDiff] = createSignal<GitDiff | boolean>();
	const [threw, setThrew] = createSignal<Error | null>(null);
	const [content, setContent] = createSignal<string>('');
	const [contentLength, setContentLength] = createSignal<number>(0);
	const [blame, setBlame] = createSignal<GitBlame | null>();
	const [submodule, setSubmodule] = createSignal<boolean>(false);

	const [switching, setSwitching] = createSignal<boolean>(false);
	const [showCommit, setShowCommit] = createSignal<boolean>(false);

	const changes = createStoreListener([FileStore], () =>
		FileStore.getByRepositoryPath(props.repository)
	);
	const commit = createStoreListener([LocationStore], () => LocationStore.selectedCommitFile);
	const repo = createStoreListener([LocationStore], () => LocationStore.selectedRepository);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const fileStatus = createStoreListener([FileStore, LocationStore], () =>
		historyOpen?.() ? commit()?.status : FileStore.getStatus(props.repository, props.file)
	);

	// only run these when needed
	const issues = useLazy(repo, (r) =>
		GitHub('repos/:username/:repo/issues').get(...repoParams(r?.remote || ''), 'open')
	);
	const prs = useLazy(repo, (r) =>
		GitHub('repos/:username/:repo/pulls').get(...repoParams(r?.remote || ''), 'open')
	);

	createStoreListener([LocationStore, FileStore], async () => {
		setBlame(null);
		setThrew(null);

		try {
			if (LocationStore.historyOpen) {
				setShowCommit(true);

				if (!LocationStore.selectedCommitFile) {
					return;
				}

				try {
					if (LocationStore.selectedCommit?.hash)
						setBlame(
							await Git.Blame(
								props.repository,
								path.join(
									LocationStore.selectedCommitFile.path,
									LocationStore.selectedCommitFile.filename
								),
								LocationStore.selectedCommit?.hash
							)
						);
				} catch (e) {
					setBlame(null);

					error(e);
				}

				setDiff(LocationStore.selectedCommitFile?.diff);
				setShouldShow(totalLines(LocationStore.selectedCommitFile?.diff?.files?.[0]) < 250);
				setShowOverridden(false);
				setShowCommit(false);

				const lastChunk =
					LocationStore.selectedCommitFile?.diff?.files?.[0]?.chunks?.slice(-1)[0];
				const lastChange = lastChunk?.changes?.slice(-1)[0];
				const lastLine =
					(lastChange as AddedLine)?.lineAfter || (lastChange as DeletedLine)?.lineBefore;

				setContentLength(lastLine || 0);

				return;
			}

			if (!props.file || !props.repository) {
				return;
			}

			if (LocationStore.selectedFile?.submodule) {
				return setSubmodule(true);
			}

			setSwitching(true);
			setShowOverridden(false);
			setShowCommit(false);
			setShouldShow(false);

			let _diff: string | boolean = '';
			let contents: string | null = null;

			try {
				contents = await Git.Content(props.file, props.repository);

				setContentLength(contents!.split('\n').length);

				_diff = await Git.Diff(props.file, props.repository);
			} catch (e) {
				setThrew(e as Error);

				setSwitching(false);

				error(e);
			}

			try {
				if (fileStatus() && fileStatus() !== 'added') {
					setBlame(await Git.Blame(props.repository, props.file));
				} else {
					setBlame(null);
				}
			} catch (e) {
				setBlame(null);

				error(e);
			}

			setSwitching(false);

			if (
				!BINARY_EXTENSIONS.includes(extname(props.file || commit()?.filename)) &&
				!IMAGE_EXTENSIONS.includes(extname(props.file || commit()?.filename))
			) {
				if (_diff === DIFF.REMOVE_ALL) {
					setContent(highlighter(contents!, langFrom(props.file || '')));

					setDiff(DIFF.REMOVE_ALL);
				} else if (_diff === DIFF.ADD_ALL) {
					setContent(highlighter(contents!, langFrom(props.file || '')));

					setDiff(DIFF.ADD_ALL);
				} else {
					const parsed = parseDiff(_diff!);

					setDiff(parsed);
				}

				setShouldShow(totalLines((diff() as GitDiff)?.files?.[0]) < 250);
			} else {
				setShouldShow(true);
			}
		} catch (e) {
			setThrew(e as Error);

			setSwitching(false);

			error(e);
		}
	});

	return (
		<Show
			when={!showCommit()}
			fallback={
				<EmptyState
					detail={t('codeview.noCommit')}
					hint={t('codeview.noCommitHint')}
					image={EmptyState.Images.NothingHere}
				/>
			}
		>
			<Show
				when={
					!(
						props.status === 'renamed' &&
						!(diff() as GitDiff)?.files?.[0]?.chunks?.length
					)
				}
				fallback={
					<EmptyState
						detail={t('codeview.renamed')}
						hint={t('codeview.renamedHint')}
						image={EmptyState.Images.NothingHere}
					/>
				}
			>
				<Show
					when={!switching()}
					fallback={
						<EmptyState
							detail={t('codeview.loading')}
							hint={t('codeview.loadingHint')}
							image={EmptyState.Images.NothingHere}
						/>
					}
				>
					<Show
						when={!threw()}
						fallback={
							<EmptyState
								detail={t('codeview.errorHint')}
								hint={threw()?.message}
								image={EmptyState.Images.Error}
							/>
						}
					>
						<Show
							when={(props.file && props.repository) || (historyOpen() && commit())}
							fallback={
								<>
									<Show
										when={props.repository}
										fallback={
											<EmptyState
												detail="No repository selected."
												hint={
													'See over there where it says "No Repository Selected"? Yeah, click that.'
												}
												image={EmptyState.Images.NothingHere}
											/>
										}
									>
										<Show
											when={changes()?.length}
											fallback={
												<div class="codeview__empty">
													<EmptyState
														horizontal
														detail={t('codeview.noChanges')}
														hint={t('codeview.noChangesHint')}
														image={EmptyState.Images.NothingHere}
													/>
													<div class="codeview__empty__actions">
														<button
															class="codeview__empty__actions__action"
															onClick={() => {
																openInEditor(repo()?.path || '');
															}}
														>
															<div class="codeview__empty__actions__action__label">
																{t('sidebar.contextMenu.openIn', {
																	name: t(
																		`settings.general.editor.${
																			SettingsStore.getSetting(
																				'externalEditor'
																			) || 'code'
																		}`
																	)
																})}
																<div class="codeview__empty__actions__action__label__accelerator">
																	<span>{'⇧'}</span>
																	<span>{meta}</span>
																	<span>C</span>
																</div>
															</div>
															<Show
																when={
																	editors.find(
																		(e) =>
																			e.exec ===
																			(SettingsStore.getSetting(
																				'externalEditor'
																			) || 'code')
																	)?.image
																}
															>
																<img
																	class="codeview__empty__actions__action__icon"
																	onError={(e) => {
																		e.target.remove(); // remove the image if it fails to load
																	}}
																	src={
																		editors.find(
																			(e) =>
																				e.exec ===
																				(SettingsStore.getSetting(
																					'externalEditor'
																				) || 'code')
																		)?.image
																	}
																/>
															</Show>
														</button>
														<button
															class="codeview__empty__actions__action"
															onClick={() => {
																openExternal(repo()?.remote || '');
															}}
														>
															<div class="codeview__empty__actions__action__label">
																{t(
																	'sidebar.contextMenu.openRemote'
																)}
																<div class="codeview__empty__actions__action__label__accelerator">
																	<span>{'⇧'}</span>
																	<span>{meta}</span>
																	<span>G</span>
																</div>
															</div>
														</button>
														<Show
															when={
																getProvider(
																	repo()?.remote ||
																		'https://rela.dev'
																) === 'github'
															}
														>
															<div class="codeview__empty__actions__group">
																<button
																	class="codeview__empty__actions__action"
																	onClick={() => {
																		openExternal(
																			issuesUrlForProvider(
																				'https://github.com',
																				repoParams(
																					repo()
																						?.remote ||
																						''
																				)
																			) || ''
																		);
																	}}
																>
																	<div class="codeview__empty__actions__action__label">
																		<span>
																			{t('git.remote.view', {
																				name: t(
																					'git.remote.issue',
																					undefined,
																					issues()?.length
																				)
																			})}
																			<Icon name="link-external" />
																		</span>
																		<div class="codeview__empty__actions__action__label__count">
																			{issues()?.length}
																		</div>
																	</div>
																	<Icon
																		name="issue-opened"
																		variant={24}
																	/>
																</button>
																<button
																	class="codeview__empty__actions__action"
																	onClick={() => {
																		openExternal(
																			pullRequestsUrlForProvider(
																				'https://github.com',
																				repoParams(
																					repo()
																						?.remote ||
																						''
																				)
																			) || ''
																		);
																	}}
																>
																	<div class="codeview__empty__actions__action__label">
																		<span>
																			{t('git.remote.view', {
																				name: t(
																					'git.remote.pull',
																					undefined,
																					prs()?.length
																				)
																			})}
																			<Icon name="link-external" />
																		</span>
																		<div class="codeview__empty__actions__action__label__count">
																			{prs()?.length}
																		</div>
																	</div>
																	<Icon
																		name="git-pull-request"
																		variant={24}
																	/>
																</button>
															</div>
														</Show>
													</div>
												</div>
											}
										>
											<EmptyState
												detail={t('codeview.noFile')}
												hint={t('codeview.noFileHint')}
												image={EmptyState.Images.NothingHere}
											/>
										</Show>
									</Show>
								</>
							}
						>
							<Show when={!submodule()} fallback={<SubmoduleView />}>
								<Show
									when={
										!IMAGE_EXTENSIONS.includes(
											extname(props.file || commit()?.filename)
										) &&
										!BINARY_EXTENSIONS.includes(
											extname(props.file || commit()?.filename)
										)
									}
									fallback={
										<>
											<Show
												when={IMAGE_EXTENSIONS.includes(
													extname(props.file || commit()?.filename)
												)}
											>
												<ImageView
													repository={props.repository}
													fromPath={
														historyOpen() ?
															path.join(
																commit()?.fromPath || '',
																commit()?.from || ''
															)
														:	props.fromFile
													}
													path={
														historyOpen() ?
															path.join(
																props.repository,
																commit()?.path || '',
																commit()?.filename || ''
															)
														:	props.file
													}
													status={fileStatus()!}
												/>
											</Show>
											<Show
												when={BINARY_EXTENSIONS.includes(
													extname(props.file || commit()?.filename)
												)}
											>
												<EmptyState
													detail={t('codeview.binary')}
													hint={t('codeview.binaryHint')}
													image={EmptyState.Images.Error}
												/>
											</Show>
										</>
									}
								>
									<Show
										when={shouldShow() || showOverridden()}
										fallback={
											<>
												<EmptyState
													detail={t('codeview.tooBig')}
													hint={t('codeview.tooBigHint')}
													actions={[
														{
															label: 'Show',
															type: 'brand',
															onClick: () => {
																setShowOverridden(true);
															}
														}
													]}
													image={EmptyState.Images.Power}
												/>
											</>
										}
									>
										<pre
											classList={{
												codeview: true,
												[`lang-${extname(props.file || '').slice(1)}`]: true
											}}
										>
											<Show
												when={
													diff() !== DIFF.ADD_ALL &&
													diff() !== DIFF.REMOVE_ALL
												}
												fallback={
													<For each={content().split('\n')}>
														{(line, index) => {
															const status = () =>
																diff() ? 'added' : 'deleted';

															const lineBlame = blame()?.[index()];

															const numberWidth = Math.max(
																35,
																(String(contentLength()).length *
																	35) /
																	3
															);

															return (
																<BlameIndicator blame={lineBlame}>
																	{(p) => (
																		<div
																			{...(lineBlame && p)}
																			classList={{
																				codeview__line:
																					true,
																				[status()]: true
																			}}
																		>
																			<div
																				class="codeview__line__number"
																				style={{
																					'min-width': `${numberWidth}px`
																				}}
																			>
																				{index()}
																			</div>
																			<div
																				classList={{
																					codeview__line__indicator:
																						true,
																					[status()]: true
																				}}
																			>
																				{(
																					status() ===
																					'added'
																				) ?
																					'+'
																				:	'-'}
																			</div>
																			<div
																				class="codeview__line__content"
																				innerHTML={dealWithTabs(
																					line
																				)}
																			></div>
																			<Show when={lineBlame}>
																				<div class="codeview__line__blame">
																					<Icon
																						name="person"
																						size={12}
																					/>
																				</div>
																			</Show>
																		</div>
																	)}
																</BlameIndicator>
															);
														}}
													</For>
												}
											>
												<For each={(diff() as GitDiff)?.files?.[0]?.chunks}>
													{(chunk) => {
														const _diff = diff();

														if (typeof _diff === 'boolean' || !_diff) {
															return null;
														}

														const from =
															chunk.type == 'Chunk' ?
																chunk.fromFileRange
															:	{ start: 0, lines: 0 };
														const to = chunk.toFileRange;

														const isLastChunk =
															_diff.files?.[0]?.chunks?.indexOf(
																chunk
															) ===
															_diff.files?.[0]?.chunks?.length - 1;
														const isFirstChunk =
															_diff.files?.[0]?.chunks?.indexOf(
																chunk
															) === 0;

														const numberWidth = Math.max(
															70,
															(String(contentLength()).length * 70) /
																3
														);

														return (
															<>
																<div class="codeview__line message">
																	<div
																		class="codeview__line__number"
																		style={{
																			'min-width': `${numberWidth}px`
																		}}
																	>
																		<Show
																			when={isFirstChunk}
																			fallback={
																				<Icon name="fold" />
																			}
																		>
																			<Icon name="fold-up" />
																		</Show>
																	</div>
																	<div class="codeview__line__content">
																		@@ -{from.start},
																		{from.lines} +{to.start},
																		{to.lines} @@{' '}
																		{chunk.context}
																	</div>
																</div>
																<For each={chunk.changes}>
																	{(change) => {
																		const line_number_one =
																			// @ts-expect-error - bad types
																			change.lineBefore || '';
																		const line_number_two =
																			// @ts-expect-error - bad types
																			change.lineAfter || '';

																		if (
																			change.type ===
																			'MessageLine'
																		)
																			return null;

																		const lineBlame =
																				blame()?.[
																					line_number_two -
																						1
																				],
																			lineStatus = status(
																				change.type
																			);

																		const numberWidth =
																			Math.max(
																				35,
																				(String(
																					contentLength()
																				).length *
																					35) /
																					3
																			);

																		return (
																			<BlameIndicator
																				blame={lineBlame}
																			>
																				{(p) => (
																					<div
																						{...(lineBlame &&
																							p)}
																						classList={{
																							codeview__line:
																								true,
																							[lineStatus]:
																								true
																						}}
																					>
																						<div
																							class="codeview__line__number"
																							style={{
																								'min-width': `${numberWidth}px`
																							}}
																						>
																							{
																								line_number_one
																							}
																						</div>
																						<div
																							class="codeview__line__number"
																							style={{
																								'min-width': `${numberWidth}px`
																							}}
																						>
																							{
																								line_number_two
																							}
																						</div>
																						<div
																							classList={{
																								codeview__line__indicator:
																									true,
																								[lineStatus]:
																									true
																							}}
																						>
																							<Show
																								when={
																									lineStatus !==
																									'unchanged'
																								}
																								fallback={
																									' '
																								}
																							>
																								{(
																									lineStatus ===
																									'added'
																								) ?
																									'+'
																								:	'-'
																								}
																							</Show>
																						</div>
																						<div
																							class="codeview__line__content"
																							innerHTML={dealWithTabs(
																								highlighter(
																									change.content,
																									langFrom(
																										props.file ||
																											commit()
																												?.filename
																									)
																								)
																							)}
																						></div>
																						<Show
																							when={
																								lineBlame
																							}
																						>
																							<div class="codeview__line__blame">
																								<Icon
																									name="person"
																									size={
																										12
																									}
																								/>
																							</div>
																						</Show>
																					</div>
																				)}
																			</BlameIndicator>
																		);
																	}}
																</For>
																<Show when={isLastChunk}>
																	<div class="codeview__line message">
																		<div
																			class="codeview__line__number"
																			style={{
																				'min-width': `${numberWidth}px`
																			}}
																		>
																			<Icon name="fold-down" />
																		</div>
																		<div class="codeview__line__content"></div>
																	</div>
																</Show>
															</>
														);
													}}
												</For>
											</Show>
										</pre>
									</Show>
								</Show>
							</Show>
						</Show>
					</Show>
				</Show>
			</Show>
		</Show>
	);
};
