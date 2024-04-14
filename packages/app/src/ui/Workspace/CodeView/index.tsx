import type { GitDiff } from 'parse-git-diff';
import { For, Show, createSignal } from 'solid-js';

import { parseDiff } from '@app/modules/git/parse-diff';
import { t } from '@app/modules/i18n';
import * as Git from '@modules/git';
import { DIFF } from '@modules/git/constants';
import highlighter, { langFrom } from '@modules/highlighter';
import { error } from '@modules/logger';
import FileStore from '@stores/files';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';

import EmptyState from '@ui/Common/EmptyState';
import Icon from '@ui/Common/Icon';

import ImageView from './ImageView';
import SubmoduleView from './SubmoduleView';
import { BINARY_EXTENSIONS, IMAGE_EXTENSIONS } from './constants';

import './index.scss';

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
	repository: string;
	fromFile?: string;
}

const dealWithTabs = (line: string) => {
	return line.replaceAll(/(?<!\S)(\t|  )/g, '<span class="pl-tab">  </span>');
};

export default (props: CodeViewProps) => {
	const [showOverridden, setShowOverridden] = createSignal<boolean>(false);
	const [shouldShow, setShouldShow] = createSignal<boolean>(false);
	const [diff, setDiff] = createSignal<GitDiff | boolean>();
	const [threw, setThrew] = createSignal<Error | null>(null);
	const [content, setContent] = createSignal<string>('');
	const [blame, setBlame] = createSignal<GitBlame | null>();
	const [submodule, setSubmodule] = createSignal<boolean>(false);

	const [switching, setSwitching] = createSignal<boolean>(false);
	const [showCommit, setShowCommit] = createSignal<boolean>(false);

	const changes = createStoreListener([FileStore], () =>
		FileStore.getByRepositoryPath(props.repository)
	);
	const commit = createStoreListener([LocationStore], () => LocationStore.selectedCommitFile);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const blameOpen = createStoreListener([LocationStore], () => LocationStore.blameOpen);
	const fileStatus = createStoreListener([FileStore, LocationStore], () =>
		historyOpen?.() ? commit()?.status : FileStore.getStatus(props.repository, props.file)
	);

	createStoreListener([LocationStore, FileStore], async () => {
		try {
			if (LocationStore.historyOpen) {
				setShowCommit(true);

				if (!LocationStore.selectedCommitFile) {
					return;
				}

				setDiff(LocationStore.selectedCommitFile?.diff);
				setShouldShow(totalLines(LocationStore.selectedCommitFile?.diff?.files?.[0]) < 250);
				setShowOverridden(false);
				setShowCommit(false);
				setThrew(null);

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
			setThrew(null);

			let _diff: string | boolean = '';
			let contents: string | null = null;

			try {
				contents = await Git.Content(props.file, props.repository);
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
											<EmptyState
												detail={t('codeview.noChanges')}
												hint={t('codeview.noChangesHint')}
												image={EmptyState.Images.NothingHere}
											/>
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

														return (
															<div
																classList={{
																	codeview__line: true,
																	[status()]: true
																}}
															>
																<div
																	class="codeview__line__number"
																	style={{
																		'min-width': `calc((${
																			String(
																				content().split(
																					'\n'
																				).length
																			).length
																		} *  35px) / 3)`
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
																	{status() === 'added' ?
																		'+'
																	:	'-'}
																</div>
																<div
																	class="codeview__line__content"
																	innerHTML={dealWithTabs(line)}
																></div>

																<Show
																	when={blameOpen() && lineBlame}
																>
																	<div
																		{...props}
																		class="codeview__line__blame"
																	>
																		{lineBlame!.author},{' '}
																		{lineBlame!.message}
																	</div>
																</Show>
															</div>
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
														_diff.files?.[0]?.chunks?.indexOf(chunk) ===
														_diff.files?.[0]?.chunks?.length - 1;
													const isFirstChunk =
														_diff.files?.[0]?.chunks?.indexOf(chunk) ===
														0;

													return (
														<>
															<div class="codeview__line message">
																<div
																	class="codeview__line__number"
																	style={{
																		'min-width': `calc(${
																			String(
																				content().split(
																					'\n'
																				).length
																			).length
																		} * 70px / 3)`
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
																	@@ -{from.start},{from.lines} +
																	{to.start},{to.lines} @@{' '}
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
																				line_number_one
																			],
																		lineStatus = status(
																			change.type
																		);

																	return (
																		<div
																			classList={{
																				codeview__line:
																					true,
																				[lineStatus]: true
																			}}
																		>
																			<div
																				class="codeview__line__number"
																				style={{
																					'min-width': `calc(${
																						String(
																							content().split(
																								'\n'
																							).length
																						).length
																					} * 35px / 3)`
																				}}
																			>
																				{line_number_one}
																			</div>
																			<div
																				class="codeview__line__number"
																				style={{
																					'min-width': `calc(${
																						String(
																							content().split(
																								'\n'
																							).length
																						).length
																					} * 35px / 3)`
																				}}
																			>
																				{line_number_two}
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
																					fallback={' '}
																				>
																					{(
																						lineStatus ===
																						'added'
																					) ?
																						'+'
																					:	'-'}
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
																					blameOpen() &&
																					lineBlame
																				}
																			>
																				<div
																					{...props}
																					class="codeview__line__blame"
																				>
																					{
																						lineBlame!
																							.author
																					}
																					,{' '}
																					{
																						lineBlame!
																							.message
																					}
																				</div>
																			</Show>
																		</div>
																	);
																}}
															</For>
															<Show when={isLastChunk}>
																<div class="codeview__line message">
																	<div
																		class="codeview__line__number"
																		style={{
																			'min-width': `calc(${
																				String(
																					content().split(
																						'\n'
																					).length
																				).length
																			} * 70px / 3)`
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
	);
};
