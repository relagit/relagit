const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import { createSignal, For, Show } from 'solid-js';

import highlighter, { langFrom } from '@modules/highlighter';
import { createStoreListener } from '@stores/index';
import { DIFF_CODES } from '@modules/git/constants';
import { parseDiff } from '@modules/git/diff';
import LocationStore from '@stores/location';
import { error } from '@modules/logger';
import FileStore from '@stores/files';
import * as Git from '@modules/git';

import EmptyState, { EMPTY_STATE_IMAGES } from '@ui/Common/EmptyState';
import Icon from '@ui/Common/Icon';

import type { GitDiff } from 'parse-git-diff';

import './index.scss';

export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.svg'];

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

export interface ICodeViewProps {
	file: string;
	repository: string;
}

const dealWithTabs = (line: string) => {
	return line.replaceAll(/(?<!\S)(\t|  )/g, '<span class="pl-tab">  </span>');
};

export default (props: ICodeViewProps) => {
	const [showOverridden, setShowOverridden] = createSignal<boolean>(false);
	const [shouldShow, setShouldShow] = createSignal<boolean>(false);
	const [diff, setDiff] = createSignal<GitDiff | null | true>();
	const [threw, setThrew] = createSignal<Error | null>(null);
	const [content, setContent] = createSignal<string>('');

	const [switching, setSwitching] = createSignal<boolean>(false);

	const changes = createStoreListener([FileStore], () =>
		FileStore.getFilesByRepositoryPath(props.repository)
	);
	const commit = createStoreListener([LocationStore], () => LocationStore.selectedCommitFile);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);

	createStoreListener([LocationStore, FileStore], async () => {
		try {
			if (LocationStore.historyOpen) {
				console.log('history open');

				if (!LocationStore.selectedCommitFile) {
					console.log('no selected commit file');

					return setShouldShow(false);
				}

				console.log('selected commit file');

				setDiff(LocationStore.selectedCommitFile?.diff);
				setContent("// this shouldn't be showing :)");
				setShouldShow(true);
				setShowOverridden(false);
				setThrew(null);

				return;
			}

			if (!props.file || !props.repository) {
				return;
			}

			setSwitching(true);

			setShowOverridden(false);
			setShouldShow(true);
			setThrew(null);

			let _diff: string | null = null;
			let contents: string | null = null;

			try {
				contents = await Git.Content(props.file, props.repository);
				_diff = await Git.Diff(props.file, props.repository);
			} catch (e) {
				setThrew(e);

				setSwitching(false);

				error(e);
			}

			setSwitching(false);

			setContent(highlighter(contents, langFrom(props.file || '')));

			if (_diff === DIFF_CODES.REMOVE_ALL) {
				setDiff(null);
			} else if (_diff === DIFF_CODES.ADD_ALL) {
				setDiff(true);
			} else {
				const parsed = parseDiff(_diff);
				setDiff(parsed);
			}

			if (!diff() || diff() === true) {
				setShouldShow(true);
			} else {
				setShouldShow((diff() as GitDiff)?.files?.[0]?.chunks.length < 10);
			}
		} catch (e) {
			setThrew(e);

			setSwitching(false);

			console.error(e);
		}
	});

	return (
		<Show
			when={!switching()}
			fallback={
				<EmptyState
					detail="Loading..."
					hint="This shouldn't take too long."
					image={{
						light: EMPTY_STATE_IMAGES.L_NOTHING_HERE,
						dark: EMPTY_STATE_IMAGES.D_NOTHING_HERE
					}}
				/>
			}
		>
			<Show
				when={!threw()}
				fallback={
					<EmptyState
						detail="Something went wrong while loading the file."
						hint={threw().message}
						image={{
							light: EMPTY_STATE_IMAGES.L_ERROR,
							dark: EMPTY_STATE_IMAGES.D_ERROR
						}}
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
										image={{
											light: EMPTY_STATE_IMAGES.L_NOTHING_HERE,
											dark: EMPTY_STATE_IMAGES.D_NOTHING_HERE
										}}
									/>
								}
							>
								<Show
									when={changes()?.length}
									fallback={
										<EmptyState
											detail="No pending changes!"
											hint="Go take a break! You've earned it."
											image={{
												light: EMPTY_STATE_IMAGES.L_NOTHING_HERE,
												dark: EMPTY_STATE_IMAGES.D_NOTHING_HERE
											}}
										/>
									}
								>
									<EmptyState
										detail="No files selected."
										hint="Click one in the sidebar over there （´・｀） to get started."
										image={{
											light: EMPTY_STATE_IMAGES.L_NOTHING_HERE,
											dark: EMPTY_STATE_IMAGES.D_NOTHING_HERE
										}}
									/>
								</Show>
							</Show>
						</>
					}
				>
					<Show
						when={
							!IMAGE_EXTENSIONS.includes(
								path.extname(props.file || commit()?.filename)
							)
						}
						fallback={
							<div class="codeview-image">
								{/* TODO */}
								<div class="codeview-image__container removed">
									<Icon name="image" />
								</div>
								<div class="codeview-image__container added">
									<Icon name="image" />
								</div>
							</div>
						}
					>
						<Show
							when={shouldShow() || showOverridden()}
							fallback={
								<>
									<EmptyState
										detail="Files too powerful!"
										hint="This file is sooo huge that we aren't rendering it for performance reasons."
										actions={[
											{
												label: 'Show',
												type: 'brand',
												onClick: () => {
													setShowOverridden(true);
												}
											}
										]}
										image={{
											light: EMPTY_STATE_IMAGES.L_POWER,
											dark: EMPTY_STATE_IMAGES.D_POWER
										}}
									/>
								</>
							}
						>
							<pre class="codeview">
								<Show
									when={diff() !== true && diff() !== null}
									fallback={
										<For each={content().split('\n')}>
											{(line, index) => {
												const status = () => (diff() ? 'added' : 'deleted');

												return (
													<div class={`codeview__line ${status()}`}>
														<div
															class="codeview__line__number"
															style={{
																'min-width': `calc(${
																	String(
																		content().split('\n').length
																	).length
																} *  35px / 3px)`
															}}
														>
															{index()}
														</div>
														<div
															class="codeview__line__content"
															innerHTML={dealWithTabs(line)}
														></div>
													</div>
												);
											}}
										</For>
									}
								>
									<For each={(diff() as GitDiff)?.files?.[0]?.chunks}>
										{(chunk) => {
											const from =
												chunk.type == 'Chunk'
													? chunk.fromFileRange
													: { start: 0, lines: 0 };
											const to = chunk.toFileRange;

											const isLastChunk =
												(diff() as GitDiff).files?.[0]?.chunks?.indexOf(
													chunk
												) ===
												(diff() as GitDiff).files?.[0]?.chunks?.length - 1;
											const isFirstChunk =
												(diff() as GitDiff).files?.[0]?.chunks?.indexOf(
													chunk
												) === 0;

											return (
												<>
													<div class="codeview__line message">
														<div
															class="codeview__line__number"
															style={{
																'min-width': `calc(${
																	String(
																		content().split('\n').length
																	).length
																} * 70px / 3px)`
															}}
														>
															<Show
																when={isFirstChunk}
																fallback={<Icon name="fold" />}
															>
																<Icon name="fold-up" />
															</Show>
														</div>
														<div class="codeview__line__content">
															@@ -{from.start},{from.lines} +
															{to.start},{to.lines} @@ {chunk.context}
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

															if (change.type === 'MessageLine')
																return null;

															return (
																<div
																	class={`codeview__line ${status(
																		change.type
																	)}`}
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
																			} * 35px / 3px)`
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
																			} * 35px / 3px)`
																		}}
																	>
																		{line_number_two}
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
																			content().split('\n')
																				.length
																		).length
																	} * 70px / 3px)`
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
	);
};
